import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connection';
import Log from '@/lib/db/models/log';
import DocumentModel from '@/lib/db/models/document';
import ChatMessage from '@/lib/db/models/chat-history';
import AnalyticsCharts from './charts';

export const metadata = {
  title: 'Analytics — Mindloom',
};

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();

  // 1. Get recent logs to extract topics
  const logs = await Log.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .lean();
    
  // 2. Get document counts by category
  const docs = await DocumentModel.find({ userId: session.userId }).lean();
  
  // Aggregate topic data from logs
  const topicCounts: Record<string, number> = {};
  logs.forEach((log: any) => {
    log.extractedTopics?.forEach((topic: string) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  const topicData = Object.entries(topicCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7); // top 7 topics

  // Aggregate category data from documents
  const catCounts: Record<string, number> = {};
  docs.forEach((doc: any) => {
    const cat = doc.category || 'Uncategorized';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  
  const categoryData = Object.entries(catCounts)
    .map(([name, value]) => ({ name, value }));

  // Aggregate activity timeline (logs per day)
  const activityMap: Record<string, number> = {};
  logs.forEach((log: any) => {
    const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  });
  
  const activityData = Object.entries(activityMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate local vs gemini queries
  const localQueries = await ChatMessage.countDocuments({ userId: session.userId, source: 'local', role: 'user' });
  const geminiQueries = await ChatMessage.countDocuments({ userId: session.userId, source: 'gemini', role: 'user' });

  const queryData = [
    { name: 'Local AI (Free)', value: localQueries },
    { name: 'Gemini (Cloud)', value: geminiQueries }
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ─── Header ─── */}
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          Knowledge Analytics
        </h1>
        <p className="text-sm text-zinc-400">
          Visualize your learning patterns, ingested documents, and extracted technical topics over time.
        </p>
      </div>

      {/* ─── Charts ─── */}
      <AnalyticsCharts 
        topicData={topicData} 
        categoryData={categoryData} 
        activityData={activityData} 
        queryData={queryData}
      />
    </div>
  );
}
