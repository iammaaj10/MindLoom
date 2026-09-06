import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export type DocumentStatus = 'uploading' | 'processing' | 'embedded' | 'failed';

export interface IDocument extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  title: string;
  fileType: 'pdf' | 'image' | 'text';
  fileUrl: string;
  rawText: string;
  category: string;
  status: DocumentStatus;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'text'],
      required: true,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    rawText: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'embedded', 'failed'],
      default: 'uploading',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
