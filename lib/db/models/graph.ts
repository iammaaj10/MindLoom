import mongoose, { Schema, Document } from 'mongoose';

export interface IGraphNode extends Document {
  name: string;
  type: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GraphNodeSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['Person', 'Organization', 'Location', 'Technology', 'Concept', 'Other'] },
    description: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate nodes for the same user
GraphNodeSchema.index({ name: 1, userId: 1 }, { unique: true });

export interface IGraphEdge extends Document {
  sourceId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  relationship: string;
  weight: number;
  chunkIds: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GraphEdgeSchema = new Schema(
  {
    sourceId: { type: Schema.Types.ObjectId, ref: 'GraphNode', required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, ref: 'GraphNode', required: true, index: true },
    relationship: { type: String, required: true },
    weight: { type: Number, default: 1 },
    chunkIds: [{ type: Schema.Types.ObjectId, ref: 'DocumentChunk' }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Prevent duplicate edges
GraphEdgeSchema.index({ sourceId: 1, targetId: 1, relationship: 1 }, { unique: true });

export const GraphNode = mongoose.models.GraphNode || mongoose.model<IGraphNode>('GraphNode', GraphNodeSchema);
export const GraphEdge = mongoose.models.GraphEdge || mongoose.model<IGraphEdge>('GraphEdge', GraphEdgeSchema);
