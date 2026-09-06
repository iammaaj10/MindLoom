import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export type RequestType = 'local' | 'gemini';

export interface IRequestLog extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  type: RequestType;
  modelUsed: string;
  tokensUsed: number;
  latencyMs: number;
  cached: boolean;
  date: Date;
}

const RequestLogSchema = new Schema<IRequestLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['local', 'gemini'],
    required: true,
  },
  modelUsed: {
    type: String,
    default: '',
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
  latencyMs: {
    type: Number,
    default: 0,
  },
  cached: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// For daily aggregations
RequestLogSchema.index({ userId: 1, date: -1, type: 1 });

const RequestLog: Model<IRequestLog> =
  mongoose.models.RequestLog ||
  mongoose.model<IRequestLog>('RequestLog', RequestLogSchema);

export default RequestLog;
