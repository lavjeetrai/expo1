import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroom extends Document {
  name: string;
  subject: string;
  code: string;
  professorEmail: string;
  professorName: string;
  students: string[]; // array of student emails
  createdAt: Date;
}

const ClassroomSchema: Schema = new Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  professorEmail: { type: String, required: true },
  professorName: { type: String, required: true },
  students: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Classroom ||
  mongoose.model<IClassroom>('Classroom', ClassroomSchema);
