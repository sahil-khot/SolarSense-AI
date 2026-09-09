const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solarsense_ai');
    console.log('Connected to MongoDB for username backfill...');

    const users = await User.find({});
    console.log(`Found ${users.length} users in database.`);

    const usedUsernames = new Set();

    for (const u of users) {
      if (!u.username) {
        let base = u.name
          ? u.name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
          : u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

        if (base.length < 3) base = `user_${base}`;
        if (base.length > 25) base = base.substring(0, 25);

        let candidate = base;
        let counter = 1;
        while (usedUsernames.has(candidate) || (await User.findOne({ username: candidate, _id: { $ne: u._id } }))) {
          candidate = `${base}_${counter}`;
          counter++;
        }

        u.username = candidate;
        u.authProvider = u.authProvider || 'local';
        await u.save({ validateBeforeSave: false });
        usedUsernames.add(candidate);
        console.log(`Updated user ${u.email} -> username: "${candidate}"`);
      } else {
        usedUsernames.add(u.username);
      }
    }

    // Ensure indexes
    await User.syncIndexes();
    console.log('Indexes synchronized successfully.');
    console.log('Username backfill migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
