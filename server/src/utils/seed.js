import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

dotenv.config({ path: path.resolve('server/.env') });

const departmentsData = [
  {
    name: 'Roads & Infrastructure',
    code: 'ROADS',
    description: 'Responsible for municipal road repair, potholes, footpaths, bridges, and traffic markings.',
    slaHours: 48,
    categories: ['Pothole', 'Damaged Road Surface', 'Broken Footpath/Pavement', 'Missing Manhole Cover', 'Bridge/Flyover Defect'],
    contactEmail: 'roads@civiceye.gov',
    contactPhone: '+91 4295 220101',
  },
  {
    name: 'Streetlights & Electricity',
    code: 'ELEC',
    description: 'Maintenance of public streetlights, high masts, transformers, and municipal electrical safety.',
    slaHours: 24,
    categories: ['Streetlight Outage', 'Exposed/Hanging Electric Wire', 'Sparking Electric Pole', 'Damaged Transformer'],
    contactEmail: 'electricity@civiceye.gov',
    contactPhone: '+91 4295 220102',
  },
  {
    name: 'Waste Management & Sanitation',
    code: 'WASTE',
    description: 'Solid waste collection, street sweeping, community bins, drain clearance, and public hygiene.',
    slaHours: 24,
    categories: ['Garbage Dump Accumulation', 'Overflowing Community Bin', 'Dead Animal Removal', 'Sewage Overflow / Clogged Drain'],
    contactEmail: 'sanitation@civiceye.gov',
    contactPhone: '+91 4295 220103',
  },
  {
    name: 'Water Supply',
    code: 'WATER',
    description: 'Municipal potable water distribution, pipeline maintenance, valve operations, and water quality.',
    slaHours: 36,
    categories: ['Pipeline Leakage / Burst', 'Contaminated Drinking Water', 'Low Water Pressure', 'No Water Supply'],
    contactEmail: 'water@civiceye.gov',
    contactPhone: '+91 4295 220104',
  },
  {
    name: 'Public Safety & Other Civic Hazards',
    code: 'SAFETY',
    description: 'Emergency civic obstacles, fallen trees, dangerous trenches, stray animal control, and structural hazards.',
    slaHours: 12,
    categories: ['Fallen Tree / Heavy Branches', 'Dangerous Open Trench', 'Stray Dog / Animal Menace', 'Structural Collapse Risk'],
    contactEmail: 'publicsafety@civiceye.gov',
    contactPhone: '+91 4295 220105',
  },
];

export const seedDatabase = async () => {
  try {
    console.log('[CivicEye Seeder] Cleaning old test data...');
    await User.deleteMany();
    await Department.deleteMany();
    await Complaint.deleteMany();
    await Notification.deleteMany();

    console.log('[CivicEye Seeder] Creating default departments...');
    const createdDepts = await Department.insertMany(departmentsData);

    console.log('[CivicEye Seeder] Creating role-based user accounts...');
    // 1. Citizen
    const citizen = await User.create({
      name: 'Demo Citizen',
      email: 'citizen@civiceye.gov',
      password: 'Citizen123!',
      phone: '+91 9842100001',
      role: 'citizen',
      designation: 'Resident Citizen',
    });

    // 2. Department Heads
    const roadsHead = await User.create({
      name: 'Er. S. Rajagopal (EE)',
      email: 'roads.head@civiceye.gov',
      password: 'DeptHead123!',
      phone: '+91 9842100002',
      role: 'dept_head',
      department: 'Roads & Infrastructure',
      designation: 'Executive Engineer - Roads',
    });

    const wasteHead = await User.create({
      name: 'Dr. M. Arunrajan (CHO)',
      email: 'waste.head@civiceye.gov',
      password: 'DeptHead123!',
      phone: '+91 9842100003',
      role: 'dept_head',
      department: 'Waste Management & Sanitation',
      designation: 'Chief Health Officer',
    });

    const waterHead = await User.create({
      name: 'Er. I. Firzaan (AE)',
      email: 'water.head@civiceye.gov',
      password: 'DeptHead123!',
      phone: '+91 9842100004',
      role: 'dept_head',
      department: 'Water Supply',
      designation: 'Assistant Engineer - Water Works',
    });

    // 3. Field Verifiers
    const roadsVerifier = await User.create({
      name: 'K. Ramanathan',
      email: 'verifier.roads@civiceye.gov',
      password: 'Verifier123!',
      phone: '+91 9842100005',
      role: 'verifier',
      department: 'Roads & Infrastructure',
      designation: 'Roads & Infrastructure Field Officer',
    });

    const wasteVerifier = await User.create({
      name: 'P. Murugesan',
      email: 'verifier.waste@civiceye.gov',
      password: 'Verifier123!',
      phone: '+91 9842100006',
      role: 'verifier',
      department: 'Waste Management & Sanitation',
      designation: 'Sanitary Inspector',
    });

    // 4. Super Admin
    const admin = await User.create({
      name: 'Commissioner Office Admin',
      email: 'admin@civiceye.gov',
      password: 'Admin123!',
      phone: '+91 9842100099',
      role: 'admin',
      designation: 'Super Administrator',
    });

    console.log('[CivicEye Seeder] Creating sample complaints from report screenshots...');

    // Complaint 1: #CMP62745974 (Direct from Figures 5.3 & 5.4 in Report)
    const c1 = await Complaint.create({
      trackingId: '#CMP62745974',
      citizen: citizen._id,
      citizenName: citizen.name,
      citizenPhone: citizen.phone,
      citizenEmail: citizen.email,
      title: 'pothole',
      description: 'Severe pothole formed right in the middle lane causing dangerous slowdowns and risk to two-wheelers.',
      mainCategory: 'Roads & Infrastructure',
      subcategory: 'Pothole',
      department: 'Roads & Infrastructure',
      severity: 'HIGH',
      priority: 'HIGH',
      urgency: 'HIGH',
      safetyRisk: 'HIGH',
      publicImpact: 'HIGH',
      status: 'SUBMITTED',
      slaState: 'ON_TRACK',
      slaDeadline: new Date(Date.now() + 36 * 60 * 60 * 1000),
      assignedVerifier: null,
      assignedVerifierName: 'Unassigned',
      location: {
        type: 'Point',
        coordinates: [77.2764, 11.5034], // Satyamangalam coordinates
      },
      formattedAddress: 'Sathy – Athani – Bhavani Road, Satyamangalam',
      locality: 'Athani Road',
      city: 'Satyamangalam',
      pincode: '638401',
      gpsAccuracy: 8,
      statusHistory: [
        {
          status: 'SUBMITTED',
          note: 'Complaint registered by citizen and routed to Roads department queue.',
          updatedBy: citizen._id,
          updatedByName: citizen.name,
          role: 'citizen',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      ],
    });

    // Complaint 2: Row 2 in Figure 5.4 ("Major Pothole on Main Road", Assigned)
    const c2 = await Complaint.create({
      trackingId: '#CMP62745980',
      citizen: citizen._id,
      citizenName: citizen.name,
      citizenPhone: citizen.phone,
      citizenEmail: citizen.email,
      title: 'Major Pothole on Main Road',
      description: 'Dangerous road crater outside bus stand exit. Multiple vehicles have scraped bottom.',
      mainCategory: 'Roads & Infrastructure',
      subcategory: 'Pothole',
      department: 'Roads & Infrastructure',
      severity: 'CRITICAL',
      priority: 'CRITICAL',
      urgency: 'HIGH',
      safetyRisk: 'HIGH',
      publicImpact: 'HIGH',
      status: 'ASSIGNED',
      slaState: 'ON_TRACK',
      slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
      assignedVerifier: roadsVerifier._id,
      assignedVerifierName: roadsVerifier.name,
      location: {
        type: 'Point',
        coordinates: [77.2780, 11.5042],
      },
      formattedAddress: 'Mysore Trunk Road, Near Bus Stand, Satyamangalam',
      locality: 'Bus Stand Junction',
      city: 'Satyamangalam',
      pincode: '638401',
      gpsAccuracy: 5,
      statusHistory: [
        {
          status: 'SUBMITTED',
          note: 'Incident reported by citizen.',
          updatedBy: citizen._id,
          updatedByName: citizen.name,
          role: 'citizen',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        },
        {
          status: 'ASSIGNED',
          note: `Assigned to ${roadsVerifier.name} for priority inspection.`,
          updatedBy: roadsHead._id,
          updatedByName: roadsHead.name,
          role: 'dept_head',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
    });

    // Complaint 3: Waste Management & Sanitation
    const c3 = await Complaint.create({
      trackingId: '#CMP73194821',
      citizen: citizen._id,
      citizenName: citizen.name,
      citizenPhone: citizen.phone,
      citizenEmail: citizen.email,
      title: 'Overflowing Community Dustbin near Bazaar',
      description: 'Garbage bins have been overflowing for 3 days attracting stray animals and creating strong stench.',
      mainCategory: 'Waste Management & Sanitation',
      subcategory: 'Overflowing Community Bin',
      department: 'Waste Management & Sanitation',
      severity: 'HIGH',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      slaState: 'ON_TRACK',
      slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
      assignedVerifier: wasteVerifier._id,
      assignedVerifierName: wasteVerifier.name,
      location: {
        type: 'Point',
        coordinates: [77.2750, 11.5020],
      },
      formattedAddress: 'Gandhi Bazaar Road, Satyamangalam',
      locality: 'Market Zone',
      city: 'Satyamangalam',
      pincode: '638401',
      statusHistory: [
        {
          status: 'SUBMITTED',
          note: 'Submitted by citizen.',
          updatedBy: citizen._id,
          updatedByName: citizen.name,
          role: 'citizen',
          timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
        {
          status: 'ASSIGNED',
          note: `Assigned to ${wasteVerifier.name}`,
          updatedBy: wasteHead._id,
          updatedByName: wasteHead.name,
          role: 'dept_head',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
        {
          status: 'IN_PROGRESS',
          note: 'Sanitation squad dispatched to clear bins and spray disinfectant.',
          updatedBy: wasteVerifier._id,
          updatedByName: wasteVerifier.name,
          role: 'verifier',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      ],
    });

    // Complaint 4: Water Supply (Resolved issue)
    const c4 = await Complaint.create({
      trackingId: '#CMP88203114',
      citizen: citizen._id,
      citizenName: citizen.name,
      citizenPhone: citizen.phone,
      citizenEmail: citizen.email,
      title: 'Drinking Water Pipeline Burst on North Street',
      description: 'Clear drinking water gushing out from cracked pipe line on North Street.',
      mainCategory: 'Water Supply',
      subcategory: 'Pipeline Leakage / Burst',
      department: 'Water Supply',
      severity: 'CRITICAL',
      priority: 'CRITICAL',
      status: 'RESOLVED',
      slaState: 'ON_TRACK',
      slaDeadline: new Date(Date.now() - 4 * 60 * 60 * 1000),
      location: {
        type: 'Point',
        coordinates: [77.2730, 11.5060],
      },
      formattedAddress: 'North Car Street, Satyamangalam',
      locality: 'North Car Street',
      city: 'Satyamangalam',
      pincode: '638401',
      statusHistory: [
        {
          status: 'SUBMITTED',
          note: 'Incident registered.',
          updatedBy: citizen._id,
          updatedByName: citizen.name,
          role: 'citizen',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          status: 'RESOLVED',
          note: 'Valve replaced and pipeline sleeve welded. Normal water pressure restored.',
          updatedBy: waterHead._id,
          updatedByName: waterHead.name,
          role: 'dept_head',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
    });

    // Complaint 5: Streetlight Outage (Closed with Citizen Confirmation)
    const c5 = await Complaint.create({
      trackingId: '#CMP91048239',
      citizen: citizen._id,
      citizenName: citizen.name,
      citizenPhone: citizen.phone,
      citizenEmail: citizen.email,
      title: 'Four consecutive streetlights unlit near BIT College Gate',
      description: 'Complete dark stretch on college road after 7 PM.',
      mainCategory: 'Streetlights & Electricity',
      subcategory: 'Streetlight Outage',
      department: 'Streetlights & Electricity',
      severity: 'MEDIUM',
      priority: 'MEDIUM',
      status: 'CLOSED',
      slaState: 'ON_TRACK',
      location: {
        type: 'Point',
        coordinates: [77.2795, 11.5005],
      },
      formattedAddress: 'Alathukombai Post, Bannari Amman Institute Road, Sathyamangalam',
      locality: 'BIT Campus Environs',
      city: 'Satyamangalam',
      pincode: '638401',
      citizenConfirmation: {
        isConfirmed: true,
        rating: 5,
        feedback: 'Fixed quickly within 24 hours. The street is well illuminated now!',
        confirmedAt: new Date(),
      },
      statusHistory: [
        {
          status: 'SUBMITTED',
          note: 'Submitted by citizen.',
          updatedBy: citizen._id,
          updatedByName: citizen.name,
          role: 'citizen',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
        {
          status: 'CLOSED',
          note: 'Citizen confirmed resolution with 5-star rating.',
          updatedBy: citizen._id,
          updatedByName: citizen.name,
          role: 'citizen',
          timestamp: new Date(),
        },
      ],
    });

    // Create notifications for demo accounts
    await Notification.create([
      {
        recipient: citizen._id,
        title: 'Welcome to CivicEye Platform',
        message: 'Your citizen identity node has been established. You can now report civic faults and track progress live.',
        type: 'SYSTEM',
      },
      {
        recipient: citizen._id,
        title: 'Status Update: #CMP62745974',
        message: 'Your report "pothole" has been routed to the Roads & Infrastructure Department.',
        type: 'STATUS_CHANGE',
        complaintId: c1._id,
        trackingId: '#CMP62745974',
      },
      {
        recipient: roadsHead._id,
        title: 'New High Priority Issue',
        message: 'New pothole reported at Sathy – Athani – Bhavani Road requiring verifier assignment.',
        type: 'ASSIGNMENT',
        complaintId: c1._id,
        trackingId: '#CMP62745974',
      },
    ]);

    console.log('[CivicEye Seeder] Database seeded successfully with demo accounts and data!');
  } catch (error) {
    console.error('[CivicEye Seeder] Error seeding database:', error);
  }
};

// If run directly: node server/src/utils/seed.js
if (process.argv[1]?.includes('seed.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  });
}
