import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export type MessageSource = 'local' | 'gemini' | 'hybrid';

export interface IChatMessage extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId; // Optional for backward compatibility
  role: 'user' | 'assistant';
  content: string;
  source: MessageSource;
  tokensUsed: number;
  latencyMs: number;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['local', 'gemini', 'hybrid'],
      default: 'local',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// For loading chat history in order
ChatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
