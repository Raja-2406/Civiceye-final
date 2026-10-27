import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';

dotenv.config({ path: path.resolve('server/.env') });

const createStaff = async () => {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const role = getArg('--role'); // 'dept_head' or 'verifier'
  const department = getArg('--dept');
  const name = getArg('--name');
  const email = getArg('--email');
  const password = getArg('--password') || 'Staff123!';
  const designation = getArg('--designation');
  const phone = getArg('--phone') || '';

  if (!role || !department || !name || !email) {
    console.log(`
Usage:
  node server/src/utils/create-staff.js --role <dept_head|verifier> --dept "<Category>" --name "<Full Name>" --email "<Email>" --password "<Pass>"

Example:
  node server/src/utils/create-staff.js --role dept_head --dept "Streetlights & Electricity" --name "Er. K. Balaji" --email "balaji.elec@civiceye.gov" --password "Balaji123!"
`);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas.');

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Account with email ${email} already exists.`);
      process.exit(1);
    }

    const defaultDesignation =
      designation ||
      (role === 'dept_head'
        ? `${department} - Department Head`
        : `${department} - Field Verifier`);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      department,
      designation: defaultDesignation,
    });

    console.log(`[CivicEye Staff Created]`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Department: ${user.department}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Designation: ${user.designation}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating staff:', err.message);
    process.exit(1);
  }
};

createStaff();
