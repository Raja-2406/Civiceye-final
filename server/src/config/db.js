import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiceye';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[CivicEye DB] Connected to MongoDB Atlas: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[CivicEye DB] Could not connect to primary MongoDB: ${primaryErr.message}`);
    
    // In-memory fallback
    try {
      console.log('[CivicEye DB] Attempting in-memory MongoDB fallback...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[CivicEye DB] Connected to In-Memory MongoDB at ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[CivicEye DB] Database connection failed completely.');
      throw primaryErr;
    }
  }
};
