import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

dotenv.config({ path: path.resolve('server/.env') });

const cleanDemoData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas:', mongoose.connection.host);

    const deletedComplaints = await Complaint.deleteMany({});
    console.log(`Deleted ${deletedComplaints.deletedCount} demo complaints.`);

    const deletedNotifications = await Notification.deleteMany({});
    console.log(`Deleted ${deletedNotifications.deletedCount} demo notifications.`);

    console.log('SUCCESS: All demo testing entries successfully purged from MongoDB Atlas.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning demo entries:', err.message);
    process.exit(1);
  }
};

cleanDemoData();
