const mongoose = require('mongoose');

const ATLAS_URI =
  'mongodb+srv://sahilkhot1152005_db_user:SolarSense2026@solarsenseai.avju7tr.mongodb.net/solarsense_ai?retryWrites=true&w=majority&appName=SolarSenseAI';

let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection if active
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const primaryUri = process.env.MONGODB_URI || ATLAS_URI;

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    cachedConnection = conn;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Primary MongoDB connection failed: ${error.message}`);

    // If primaryUri failed and wasn't the Atlas URI, try Atlas URI as fallback
    if (primaryUri !== ATLAS_URI) {
      try {
        console.log('[Database] Connecting to fallback MongoDB Atlas...');
        const fallbackConn = await mongoose.connect(ATLAS_URI, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        });
        cachedConnection = fallbackConn;
        console.log(`[Database] Connected to fallback MongoDB Atlas: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error(`[Database Error] Fallback Atlas connection also failed: ${fallbackErr.message}`);
      }
    }

    throw error;
  }
};

module.exports = connectDB;
