import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentEmail: string;
  studentName: string;
  attachments: { fileName: string; filePath: string }[];
  submittedAt: Date;
  grade?: string;
}

const SubmissionSchema: Schema = new Schema({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, default: '' },
  attachments: {
    type: [{ fileName: String, filePath: String }],
    default: [],
  },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: String },
});

// One submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentEmail: 1 }, { unique: true });

export default mongoose.models.Submission ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema);
