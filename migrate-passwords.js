require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// CHANGE THESE
const EMAIL = 'admin@benedicto.edu';
const NEW_PASSWORD = 'MyNewPass2026';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection('users');
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  const result = await users.updateOne(
    { email: EMAIL },
    { $set: { password: hash } }
  );
  console.log('Matched:', result.matchedCount, '| Modified:', result.modifiedCount);
  process.exit(0);
})();