const mongoose = require('mongoose');
const User = require('../models/User');

async function fixAdmin() {
  await mongoose.connect('mongodb://127.0.0.1:27017/solarsense_ai');
  const updated = await User.findOneAndUpdate(
    { email: 'admin@solarsense.ai' },
    { $set: { username: 'admin', name: 'SolarSense System Admin' } },
    { new: true }
  );
  console.log('Admin updated in DB:', { username: updated.username, name: updated.name, email: updated.email });
  await mongoose.disconnect();
}

fixAdmin().catch(console.error);
