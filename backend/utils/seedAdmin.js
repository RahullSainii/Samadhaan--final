const User = require('../models/User');

const seedAdminIfConfigured = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';
  const force = String(process.env.ADMIN_FORCE || '').toLowerCase() === 'true';

  if (!email || !password) {
    return;
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.role === 'Admin') {
        console.log(`Admin seed skipped: ${email} already exists.`);
        return;
      }

      if (!force) {
        console.warn(`Admin seed skipped: ${email} exists as a non-admin. Set ADMIN_FORCE=true to promote.`);
        return;
      }

      existing.role = 'Admin';
      if (password) {
        existing.password = password;
      }
      existing.name = existing.name || name;
      await existing.save();
      console.log(`Admin seed promoted existing user: ${email}`);
      return;
    }

    await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'Admin',
    });

    console.log(`Admin seed created: ${email}`);
  } catch (error) {
    console.error(`Admin seed failed: ${error.message}`);
  }
};

module.exports = { seedAdminIfConfigured };
