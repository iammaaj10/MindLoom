import type { Metadata } from 'next';
import { getDocuments } from '@/app/actions/documents';
import UploadForm from '@/components/documents/upload-form';
import DocumentList from '@/components/documents/document-list';

export const metadata: Metadata = {
  title: 'Documents & Knowledge Ingestion',
};

export default async function DocumentsPage() {
  const documents = await getDocuments();

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Knowledge Ingestion
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Week 1 Ingestion Pipeline
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Files uploaded here are extracted, chunked, and prepared for local vector search.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">Total Docs:</span>
            <span className="text-xs font-bold font-mono text-white">{documents.length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 flex items-center gap-2">
            <span className="text-xs text-cyan-400/80 font-mono">Total Chunks:</span>
            <span className="text-xs font-bold font-mono text-cyan-300">{totalChunks}</span>
          </div>
        </div>
      </div>

      {/* ─── Upload Card ─── */}
      <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">
              Ingest New Source File
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Auto-tokenized & chunked</span>
        </div>
        <UploadForm />
      </div>

      {/* ─── Stored Documents Grid ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 tracking-tight flex items-center gap-2">
            <span>Indexed Documents</span>
            <span className="text-xs text-zinc-500 font-normal">({documents.length})</span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Stored in MongoDB</span>
        </div>
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
