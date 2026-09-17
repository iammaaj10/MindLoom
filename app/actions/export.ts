'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import DocumentModel from '@/lib/db/models/document';
import Log from '@/lib/db/models/log';
import ChatMessage from '@/lib/db/models/chat-history';
import ChatSession from '@/lib/db/models/chat-session';
import StudyItem from '@/lib/db/models/study-plan';

export type ExportFormat = 'json' | 'csv';

/**
 * Export all user data as JSON or CSV.
 * Returns a string that the client can trigger as a download.
 */
export async function exportUserData(format: ExportFormat = 'json') {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();

    const [documents, logs, chatSessions, chatMessages, studyItems] =
      await Promise.all([
        DocumentModel.find({ userId: session.userId })
          .select('title fileType category status chunkCount createdAt')
          .lean(),
        Log.find({ userId: session.userId })
          .select('content extractedTopics date createdAt')
          .sort({ createdAt: -1 })
          .limit(500)
          .lean(),
        ChatSession.find({ userId: session.userId })
          .select('title createdAt updatedAt')
          .lean(),
        ChatMessage.find({ userId: session.userId })
          .select('sessionId role content source createdAt')
          .sort({ createdAt: 1 })
          .limit(2000)
          .lean(),
        StudyItem.find({ userId: session.userId })
          .select('topic easeFactor interval repetitions nextReview lastReviewed createdAt')
          .lean(),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: { email: session.email, name: session.name },
      documents: documents.map((d: any) => ({
        title: d.title,
        fileType: d.fileType,
        category: d.category,
        status: d.status,
        chunkCount: d.chunkCount,
        createdAt: d.createdAt?.toISOString(),
      })),
      journalEntries: logs.map((l: any) => ({
        content: l.content,
        topics: l.extractedTopics || [],
        date: l.date?.toISOString(),
        createdAt: l.createdAt?.toISOString(),
      })),
      chatSessions: chatSessions.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        createdAt: s.createdAt?.toISOString(),
      })),
      chatMessages: chatMessages.map((m: any) => ({
        sessionId: m.sessionId?.toString(),
        role: m.role,
        content: m.content,
        source: m.source,
        createdAt: m.createdAt?.toISOString(),
      })),
      studyItems: studyItems.map((si: any) => ({
        topic: si.topic,
        easeFactor: si.easeFactor,
        interval: si.interval,
        repetitions: si.repetitions,
        nextReview: si.nextReview?.toISOString(),
        lastReviewed: si.lastReviewed?.toISOString(),
      })),
    };

    if (format === 'json') {
      return { success: true, data: JSON.stringify(exportData, null, 2), filename: 'mindloom-export.json', mimeType: 'application/json' };
    }

    // CSV format: flatten into separate sections
    const csvSections: string[] = [];

    // Documents
    csvSections.push('=== DOCUMENTS ===');
    csvSections.push('Title,File Type,Category,Status,Chunks,Created At');
    exportData.documents.forEach(d => {
      csvSections.push(`"${d.title}","${d.fileType}","${d.category}","${d.status}",${d.chunkCount},"${d.createdAt}"`);
    });

    // Journal
    csvSections.push('');
    csvSections.push('=== JOURNAL ENTRIES ===');
    csvSections.push('Content,Topics,Date');
    exportData.journalEntries.forEach(j => {
      const safeContent = j.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csvSections.push(`"${safeContent}","${j.topics.join('; ')}","${j.createdAt}"`);
    });

    // Chat Messages
    csvSections.push('');
    csvSections.push('=== CHAT MESSAGES ===');
    csvSections.push('Session ID,Role,Source,Content,Created At');
    exportData.chatMessages.forEach(m => {
      const safeContent = m.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csvSections.push(`"${m.sessionId}","${m.role}","${m.source || ''}","${safeContent}","${m.createdAt}"`);
    });

    // Study Items
    csvSections.push('');
    csvSections.push('=== STUDY ITEMS ===');
    csvSections.push('Topic,Ease Factor,Interval (days),Repetitions,Next Review');
    exportData.studyItems.forEach(s => {
      csvSections.push(`"${s.topic}",${s.easeFactor},${s.interval},${s.repetitions},"${s.nextReview}"`);
    });

    return { success: true, data: csvSections.join('\n'), filename: 'mindloom-export.csv', mimeType: 'text/csv' };
  } catch (error) {
    console.error('Export failed:', error);
    return { error: 'Failed to export data' };
  }
}
