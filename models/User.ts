import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  role: 'student' | 'professor';
  password?: string;
  name?: string;
  firebaseUid?: string;
  registrationNumber?: string;
  course?: string;
  section?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['student', 'professor'], default: 'student' },
  name: { type: String },
  firebaseUid: { type: String, unique: true, sparse: true },
  registrationNumber: { type: String },
  course: { type: String },
  section: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
