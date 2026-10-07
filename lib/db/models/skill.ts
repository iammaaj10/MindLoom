import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkill extends Document {
  userId: string;
  topic: string;
  xp: number;
  level: number;
  unlockedPerks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    unlockedPerks: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

SkillSchema.index({ userId: 1, topic: 1 }, { unique: true });

export default (mongoose.models.Skill as Model<ISkill>) || mongoose.model<ISkill>('Skill', SkillSchema);
