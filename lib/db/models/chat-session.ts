import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export interface IChatSession extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching recent sessions for a user
ChatSessionSchema.index({ userId: 1, updatedAt: -1 });

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);

export default ChatSession;
