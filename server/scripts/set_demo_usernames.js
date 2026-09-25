const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');

const setDemoUsernames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const mapping = {
      'admin@solarsense.ai': 'admin',
      'rahul.residential@solarsense.ai': 'rahul_sharma',
      'ramesh.farm@solarsense.ai': 'ramesh_patil',
      'priya.business@solarsense.ai': 'priya_verma',
      'arjun.commercial@solarsense.ai': 'arjun_singhania',
    };

    for (const [email, username] of Object.entries(mapping)) {
      const user = await User.findOne({ email });
      if (user) {
        user.username = username;
        await user.save({ validateBeforeSave: false });
        console.log(`Set ${email} -> username: "${username}"`);
      }
    }

    await User.syncIndexes();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
};

setDemoUsernames();
