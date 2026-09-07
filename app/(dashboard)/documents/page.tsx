import type { Metadata } from 'next';
import { getDocuments } from '@/app/actions/documents';
import UploadForm from '@/components/documents/upload-form';
import DocumentList from '@/components/documents/document-list';

export const metadata: Metadata = {
  title: 'Documents',
};

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Upload files to train your personal AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="text-xs font-mono px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              color: 'var(--text-tertiary)',
            }}
          >
            {documents.length} {documents.length === 1 ? 'file' : 'files'}
          </div>
        </div>
      </div>

      {/* ─── Upload ─── */}
      <div className="card p-6 animate-fade-up delay-100">
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          Upload new document
        </h2>
        <UploadForm />
      </div>

      {/* ─── Document List ─── */}
      <div className="animate-fade-up delay-200">
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Your documents
        </h2>
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
