import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export interface IChunk extends MongoDoc {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  embedding: number[];
  metadata: {
    topic: string;
    entities: string[];
    chunkIndex: number;
  };
  createdAt: Date;
}

const ChunkSchema = new Schema<IChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      topic: { type: String, default: 'general' },
      entities: { type: [String], default: [] },
      chunkIndex: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient per-user vector search
ChunkSchema.index({ userId: 1, documentId: 1 });

const Chunk: Model<IChunk> =
  mongoose.models.Chunk || mongoose.model<IChunk>('Chunk', ChunkSchema);

export default Chunk;
