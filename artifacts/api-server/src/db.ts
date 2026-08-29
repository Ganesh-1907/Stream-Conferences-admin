import mongoose from 'mongoose';
import { logger } from './lib/logger';

const MONGO_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/stream-conf';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB successfully at ' + MONGO_URI);
    await seedUsers();
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error as any);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'mentor'] }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Conference Schema
const conferenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  day: { type: String, required: true },
  month: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true, enum: ['upcoming', 'past'] },
  announcedBy: { type: String, required: true }
});

export const Conference = mongoose.models.Conference || mongoose.model('Conference', conferenceSchema);

// Webinar Schema
const webinarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  day: { type: String, required: true },
  month: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true, enum: ['upcoming', 'past'] },
  speaker: { type: String, required: true },
  announcedBy: { type: String, required: true }
});

export const Webinar = mongoose.models.Webinar || mongoose.model('Webinar', webinarSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  label: { type: String, required: true },
  copy: { type: String, required: true },
  content: { type: String, required: true },
  announcedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

// Registration Schema
const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  institution: { type: String, required: true },
  country: { type: String, required: true },
  category: { type: String, required: true },
  presentingAbstract: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

// Abstract Submission Schema
const abstractSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  track: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Abstract = mongoose.models.Abstract || mongoose.model('Abstract', abstractSchema);

// Default users seeding
async function seedUsers() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      logger.info('Seeded default admin user: admin / admin123');
    }

    const mentorExists = await User.findOne({ username: 'mentor' });
    if (!mentorExists) {
      await User.create({
        username: 'mentor',
        password: 'mentor123',
        role: 'mentor'
      });
      logger.info('Seeded default mentor user: mentor / mentor123');
    }
  } catch (error) {
    logger.error('Error seeding users:', error as any);
  }
}
