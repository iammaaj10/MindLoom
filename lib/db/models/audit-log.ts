import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  eventType: 'query' | 'ingestion' | 'intelligence';
  source: 'local' | 'gemini' | 'hybrid';
  latencyMs: number;
  tokensUsed: number;
  metadata?: any;
  createdAt: Date;
}

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: ['query', 'ingestion', 'intelligence'],
      required: true,
    },
    source: {
      type: String,
      enum: ['local', 'gemini', 'hybrid'],
      required: true,
    },
    latencyMs: { type: Number, required: true },
    tokensUsed: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
