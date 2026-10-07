import type { Metadata } from 'next';
import { getDocuments } from '@/app/actions/documents';
import UploadForm from '@/components/documents/upload-form';
import DocumentList from '@/components/documents/document-list';
import DocumentsClientWrapper from './documents-client';

export const metadata: Metadata = {
  title: 'Documents & Knowledge Ingestion',
};

export default async function DocumentsPage() {
  const documents = await getDocuments();
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);

  return (
    <DocumentsClientWrapper documentsLength={documents.length} totalChunks={totalChunks}>
      {/* ─── Upload Card ─── */}
      <div className="relative rounded-3xl p-8 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-2xl overflow-hidden group hover:border-white/10 transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-indigo-500/0 group-hover:from-cyan-500/5 group-hover:to-indigo-500/5 transition-colors duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] animate-pulse" />
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Ingest New Source File
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-medium bg-white/5 px-3 py-1 rounded-md border border-white/5">Auto-tokenized</span>
          </div>
          <UploadForm />
        </div>
      </div>

      {/* ─── Stored Documents Grid ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-3">
            Indexed Documents
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white border border-white/5">{documents.length}</span>
          </h2>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest px-3 py-1 rounded bg-black border border-white/5 shadow-inner">MongoDB Storage</span>
        </div>
        <DocumentList documents={documents} />
      </div>
    </DocumentsClientWrapper>
  );
}
