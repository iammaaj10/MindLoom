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

export async function getNodeDetails(nodeId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await dbConnect();

  try {
    const node = await GraphNode.findOne({ _id: nodeId, userId: session.userId }).lean();
    if (!node) return { error: 'Node not found' };

    const edges = await GraphEdge.find({
      userId: session.userId,
      $or: [{ sourceId: nodeId }, { targetId: nodeId }]
    })
    .populate('sourceId', 'name type')
    .populate('targetId', 'name type')
    .lean();

    const formattedEdges = edges.map((e: any) => ({
      id: e._id.toString(),
      relationship: e.relationship,
      source: { id: e.sourceId._id.toString(), name: e.sourceId.name, type: e.sourceId.type },
      target: { id: e.targetId._id.toString(), name: e.targetId.name, type: e.targetId.type },
      weight: e.weight,
    }));

    return {
      success: true,
      node: {
        id: node._id.toString(),
        name: node.name,
        type: node.type,
        description: node.description,
      },
      edges: formattedEdges,
    };
  } catch (error: any) {
    console.error('Failed to get node details:', error);
    return { error: 'Failed to fetch node details' };
  }
}
