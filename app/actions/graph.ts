'use server';

import dbConnect from '@/lib/db/connection';
import { GraphNode, GraphEdge } from '@/lib/db/models/graph';
import { getSession } from '@/lib/auth/session';

export async function getKnowledgeGraph() {
  const session = await getSession();
  if (!session) return { nodes: [], links: [] };

  await dbConnect();

  const nodes = await GraphNode.find({ userId: session.userId }).lean();
  const edges = await GraphEdge.find({ userId: session.userId }).lean();

  const formattedNodes = nodes.map(n => ({
    id: n._id.toString(),
    name: n.name,
    type: n.type,
    description: n.description,
    val: 1, // Size of the node
  }));

  const formattedLinks = edges.map(e => ({
    source: e.sourceId.toString(),
    target: e.targetId.toString(),
    label: e.relationship,
    value: e.weight,
  }));

  return { nodes: formattedNodes, links: formattedLinks };
}
