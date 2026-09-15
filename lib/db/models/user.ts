import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export interface IUser extends MongoDoc {
  name: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  geminiApiKey?: string;       // encrypted ciphertext
  geminiApiKeyIv?: string;     // AES-GCM initialization vector
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password hash'],
    },
    displayName: {
      type: String,
      trim: true,
    },
    geminiApiKey: {
      type: String, // AES-256-GCM encrypted ciphertext
      trim: true,
    },
    geminiApiKeyIv: {
      type: String, // Initialization vector for decryption
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
