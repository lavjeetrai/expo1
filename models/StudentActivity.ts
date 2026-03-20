import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentActivity extends Document {
  classroomId: mongoose.Types.ObjectId;
  studentEmail: string;
  studentName: string;
  type: 'question' | 'submission';
  content: string;          // raw question text or assignment title + filename
  topic: string;            // AI-extracted topic
  weakConcepts: string[];   // AI-extracted weak areas
  confidenceScore: number;  // 0-100
  aiFeedback: string;       // Short AI summary
  createdAt: Date;
}

const StudentActivitySchema: Schema = new Schema({
  classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, default: '' },
  type: { type: String, enum: ['question', 'submission'], required: true },
  content: { type: String, required: true },
  topic: { type: String, default: 'General' },
  weakConcepts: { type: [String], default: [] },
  confidenceScore: { type: Number, default: 50, min: 0, max: 100 },
  aiFeedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Index for fast classroom queries
StudentActivitySchema.index({ classroomId: 1, createdAt: -1 });
StudentActivitySchema.index({ classroomId: 1, studentEmail: 1 });

export default mongoose.models.StudentActivity ||
  mongoose.model<IStudentActivity>('StudentActivity', StudentActivitySchema);
