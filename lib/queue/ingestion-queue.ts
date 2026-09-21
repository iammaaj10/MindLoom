import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dbConnect from '@/lib/db/connection';
import DocumentModel from '@/lib/db/models/document';
import { extractText } from '@/lib/ingestion/extractor';
import { chunkText } from '@/lib/ingestion/chunker';
import { generateEmbeddings, extractEntities } from '@/lib/ml/client';
import { extractGraphEntities } from '@/lib/ai/gemini';
import { GraphNode, GraphEdge } from '@/lib/db/models/graph';
import Chunk from '@/lib/db/models/chunk';
import AuditLog from '@/lib/db/models/audit-log';
import mongoose from 'mongoose';

// Attempt to connect to local Redis. If it fails, we catch it later.
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts so it doesn't hang forever
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  }
});

export const ingestionQueue = new Queue('DocumentIngestion', { connection });

export type IngestionJobData = {
  documentId: string;
  userId: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'text';
};

// Start the worker process
export const ingestionWorker = new Worker(
  'DocumentIngestion',
  async (job: Job<IngestionJobData>) => {
    const { documentId, userId, fileUrl, fileType } = job.data;
    console.log(`[Queue] Starting ingestion for document ${documentId}`);

    try {
      await dbConnect();
      
      // Update status to processing
      await DocumentModel.findByIdAndUpdate(documentId, { status: 'processing' });

      // 1. Extract text
      const extractedText = await extractText(fileUrl, fileType);
      
      // 2. Chunk text
      const chunks = chunkText(extractedText);
      
      // 3. Generate embeddings & extract entities
      const texts = chunks.map(c => c.text);
      let embeddings: number[][] = [];
      let mlEntities: string[][] = [];

      try {
        const mlResult = await Promise.all([
          generateEmbeddings(texts),
          extractEntities(texts)
        ]);
        embeddings = mlResult[0];
        mlEntities = mlResult[1];
      } catch (err: any) {
        console.warn(`[Queue] ML service failed for document ${documentId}. Falling back to empty arrays.`);
        embeddings = new Array(texts.length).fill([]);
        mlEntities = new Array(texts.length).fill([]);
      }

      // 4. Save chunks
      const chunkDocs = chunks.map((chunk, i) => ({
        userId: new mongoose.Types.ObjectId(userId),
        documentId: new mongoose.Types.ObjectId(documentId),
        content: chunk.text,
        embedding: embeddings[i] || [],
        metadata: {
          chunkIndex: i,
          topic: 'general',
          entities: mlEntities[i] || [],
        },
      }));

      await Chunk.insertMany(chunkDocs);
      const savedChunks = await Chunk.find({ documentId }).select('_id').lean();
      const savedChunkIds = savedChunks.map(c => c._id);

      // 5. Graph Extraction (Optional but good for Knowledge Graph)
      try {
        const fullText = texts.join('\n\n').substring(0, 15000);
        const graphData = await extractGraphEntities(fullText, userId);
        
        if (graphData && graphData.nodes && graphData.nodes.length > 0) {
          const nodeMap = new Map();
          for (const node of graphData.nodes) {
            const created = await GraphNode.findOneAndUpdate(
              { userId, name: node.name },
              { $setOnInsert: { type: node.type, description: node.description } },
              { upsert: true, new: true }
            );
            nodeMap.set(node.name, created._id);
          }

          if (graphData.edges && graphData.edges.length > 0) {
            for (const edge of graphData.edges) {
              const sourceId = nodeMap.get(edge.source);
              const targetId = nodeMap.get(edge.target);
              if (sourceId && targetId) {
                await GraphEdge.create({
                  userId,
                  sourceId,
                  targetId,
                  relationship: edge.relationship,
                  weight: 1.0,
                  chunkIds: savedChunkIds,
                });
              }
            }
          }
        }
      } catch (graphErr) {
        console.error(`[Queue] Graph extraction failed for ${documentId}`, graphErr);
      }

      // 6. Complete
      await DocumentModel.findByIdAndUpdate(documentId, {
        status: 'embedded',
        chunkCount: chunks.length,
      });

      // Write to Telemetry
      await AuditLog.create({
        userId: new mongoose.Types.ObjectId(userId),
        eventType: 'ingestion',
        source: 'local',
        latencyMs: Date.now() - job.timestamp,
        tokensUsed: chunks.length * 250, // rough estimate
        metadata: { chunks: chunks.length }
      });

      console.log(`[Queue] Successfully ingested document ${documentId}`);

    } catch (error) {
      console.error(`[Queue] Ingestion failed for document ${documentId}`, error);
      await DocumentModel.findByIdAndUpdate(documentId, { status: 'failed' }).catch(() => {});
      throw error;
    }
  },
  { connection }
);

// Worker error handling
ingestionWorker.on('failed', (job, err) => {
  console.error(`[Queue] Job ${job?.id} failed:`, err);
});
