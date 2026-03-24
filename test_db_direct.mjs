import mongoose from 'mongoose';
import fs from 'fs';

const MONGODB_URI = "mongodb+srv://lavjeetkumarrai_db_user:lavrai@cluster0.p8n4fpk.mongodb.net/newtarn?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: false },
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function check() {
  await mongoose.connect(MONGODB_URI);
  const email = "test_user_123@example.com";
  const user = await User.findOne({ email }).select('+password');
  
  let output = "";
  if (!user) {
    output = "User not found!\n";
  } else {
    output += "User found!\n";
    output += `Exact email in DB: "${user.email}"\n`;
    output += `Exact email length: ${user.email.length}\n`;
    output += `Exact password in DB: "${user.password}"\n`;
    output += `Exact password length: ${user.password.length}\n`;
    output += `Comparison with 'mySecretPassword123': ${user.password === "mySecretPassword123"}\n`;
  }
  
  fs.writeFileSync('db_check_output.txt', output);
  await mongoose.disconnect();
}

check().catch(console.error);
