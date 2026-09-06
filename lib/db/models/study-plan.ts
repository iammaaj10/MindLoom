import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export interface IStudyItem extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  topic: string;
  lastReviewed: Date;
  nextReview: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
  createdAt: Date;
}

const StudyItemSchema = new Schema<IStudyItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    lastReviewed: {
      type: Date,
      default: Date.now,
    },
    nextReview: {
      type: Date,
      default: Date.now,
    },
    easeFactor: {
      type: Number,
      default: 2.5, // SM-2 default starting ease
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 1, // days
    },
    repetitions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// For finding items due for review
StudyItemSchema.index({ userId: 1, nextReview: 1 });

const StudyItem: Model<IStudyItem> =
  mongoose.models.StudyItem ||
  mongoose.model<IStudyItem>('StudyItem', StudyItemSchema);

export default StudyItem;
