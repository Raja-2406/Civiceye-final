import mongoose from 'mongoose';

const testUri = process.argv[2] || 'mongodb+srv://rajacs2406_db_user:bRdIeBt2mScEizgy@cluster0.bbh7k8p.mongodb.net/civiceye?retryWrites=true&w=majority';

console.log('Testing connection to MongoDB Atlas...');

try {
  const conn = await mongoose.connect(testUri, { serverSelectionTimeoutMS: 15000 });
  console.log('SUCCESS: Successfully connected to MongoDB Atlas host:', conn.connection.host);
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  await mongoose.disconnect();
} catch (err) {
  console.error('FAILED: Connection error:', err.message);
}
