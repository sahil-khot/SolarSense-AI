const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/solarsense_ai';

  try {
    const conn = await mongoose.connect(primaryUri || localUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Primary connection failed: ${error.message}`);
    if (primaryUri && !primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
      console.log('[Database] Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/solarsense_ai)...');
      try {
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[Database] Fallback MongoDB Connected: ${localConn.connection.host} / ${localConn.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`[Database Error] Local MongoDB fallback also failed: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
