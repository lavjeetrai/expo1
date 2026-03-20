import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  classroomId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate?: Date;
  attachments: { fileName: string; filePath: string }[];
  createdAt: Date;
}

const AssignmentSchema: Schema = new Schema({
  classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  attachments: {
    type: [{ fileName: String, filePath: String }],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Assignment ||
  mongoose.model<IAssignment>('Assignment', AssignmentSchema);
