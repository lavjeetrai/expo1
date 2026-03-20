import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");
  
  await mongoose.connect(MONGODB_URI);
  
  const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'professor'], default: 'student' },
    name: { type: String },
  }, { strict: false });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  // Clear existing instances to prevent unique constraint errors during seed replays
  await User.deleteMany({ email: { $in: ['lavjeet@gmail.com', 'lavjeet1@gmail.com'] } });
  
  await User.create([
    { email: 'lavjeet@gmail.com', password: '123456', role: 'student', name: 'Lavjeet Student' },
    { email: 'lavjeet1@gmail.com', password: '123456', role: 'professor', name: 'Lavjeet Professor' }
  ]);
  
  console.log("Database seeded successfully with test accounts!");
  process.exit(0);
}

seed().catch(console.error);
