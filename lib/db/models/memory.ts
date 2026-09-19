import mongoose, { Schema, Document } from 'mongoose';

export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'Preference' | 'Goal' | 'Fact';
  content: string;
  source: 'User' | 'Inferred';
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['Preference', 'Goal', 'Fact'],
      required: true,
    },
    content: { type: String, required: true },
    source: {
      type: String,
      enum: ['User', 'Inferred'],
      default: 'Inferred',
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups by user
memorySchema.index({ userId: 1, category: 1 });

const Memory = mongoose.models.Memory || mongoose.model<IMemory>('Memory', memorySchema);

export default Memory;
