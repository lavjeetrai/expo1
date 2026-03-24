import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");
  
  await mongoose.connect(MONGODB_URI);
  
  const ClassroomSchema = new mongoose.Schema({}, { strict: false });
  const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);

  const classrooms = await Classroom.find({});
  console.log("Total classrooms:", classrooms.length);
  console.log("Classrooms detail:", JSON.stringify(classrooms, null, 2));
  
  process.exit(0);
}

check().catch(console.error);
