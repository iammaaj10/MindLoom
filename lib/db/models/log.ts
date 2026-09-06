import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export interface ILog extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  extractedTopics: string[];
  extractedTimeSpent: { topic: string; minutes: number }[];
  date: Date;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Log content is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    extractedTopics: {
      type: [String],
      default: [],
    },
    extractedTimeSpent: [
      {
        topic: { type: String },
        minutes: { type: Number },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for per-user date queries
LogSchema.index({ userId: 1, date: -1 });

const Log: Model<ILog> =
  mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

export default Log;
