const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/user');
const Client = require('../src/models/Client');
const Project = require('../src/models/Project');
const TimeLog = require('../src/models/TimeLog');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');
const Expense = require('../src/models/Expense');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freelancerflow';

async function seedData() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Starting to seed sample data...\n');

    // Step 1: Find or create a test user
    const userEmail = '2024.rajk@isu.ac.in';
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log('➕ User not found, creating a new test user...');
      user = await User.create({
        fullName: 'Raj Koli',
        email: userEmail,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv', // Dummy hash
        currency: 'INR',
        defaultHourlyRate: 2000
      });
    }

    console.log('✅ Using user:', user.fullName);
    const userId = user._id;

    // Optional: Clear existing data for this user to avoid duplicates
    // await Client.deleteMany({ userId });
    // await Project.deleteMany({ userId });
    // await TimeLog.deleteMany({ userId });
    // await Invoice.deleteMany({ userId });
    // await Payment.deleteMany({ userId });
    // await Expense.deleteMany({ userId });

    // Step 2: Create Clients
    console.log('\n📋 Creating Clients...');

    const client1 = await Client.create({
      userId,
      clientType: 'Company',
      name: 'TechStart Solutions',
      company: 'TechStart Solutions Pvt Ltd',
      email: 'contact@techstart.com',
      phone: '+91-9876543210',
      currency: 'INR',
      defaultHourlyRate: 2500,
      status: 'Active'
    });

    const client2 = await Client.create({
      userId,
      clientType: 'Individual',
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91-9123456789',
      currency: 'INR',
      defaultHourlyRate: 1500,
      status: 'Active'
    });

    const client3 = await Client.create({
      userId,
      clientType: 'Company',
      name: 'Global Enterprises',
      company: 'Global Enterprises LLC',
      email: 'info@globalent.com',
      currency: 'USD',
      defaultHourlyRate: 150,
      status: 'Active'
    });
    console.log(`✅ Created ${[client1, client2, client3].length} clients`);

    // Step 3: Create Projects
    console.log('\n🚀 Creating Projects...');

    const project1 = await Project.create({
      userId,
      clientId: client1._id,
      title: 'E-commerce Website',
      billingType: 'Hourly',
      hourlyRate: 2500,
      status: 'active'
    });

    const project2 = await Project.create({
      userId,
      clientId: client2._id,
      title: 'Portfolio Design',
      billingType: 'Fixed',
      fixedPrice: 35000,
      status: 'active'
    });

    const project3 = await Project.create({
      userId,
      clientId: client3._id,
      title: 'API Development',
      billingType: 'Hourly',
      hourlyRate: 150,
      status: 'active'
    });
    console.log(`✅ Created ${[project1, project2, project3].length} projects`);

    // Step 4: Log Time
    console.log('\n⏱️ Logging Time Entries...');
    const days = [5, 10, 15, 20, 25];
    for (const day of days) {
      await TimeLog.create({
        userId,
        projectId: project1._id,
        date: new Date(`2024-12-${day}`),
        hours: 6 + Math.random() * 4,
        description: `Working on module ${day}`,
        billable: true,
        invoiced: false
      });
    }
    console.log('✅ Logged time entries for project 1');

    // Step 5: Create Expenses
    console.log('\n💸 Creating Expenses...');
    const expenseCategories = ['Software & Tools', 'Subscriptions', 'Office Supplies', 'Marketing & Advertising'];
    for (let i = 0; i < 8; i++) {
      await Expense.create({
        userId,
        category: expenseCategories[i % expenseCategories.length],
        description: `Sample Expense ${i + 1}`,
        amount: 500 + Math.random() * 2000,
        date: new Date(Date.now() - (i * 5 * 24 * 60 * 60 * 1000)),
        paymentMethod: 'Credit Card',
        taxDeductible: true
      });
    }
    console.log('✅ Created 8 sample expenses');

    // Step 6: Create Invoices & Payments
    console.log('\n💰 Creating Invoices & Payments...');
    const invoice1 = await Invoice.create({
      userId,
      clientId: client1._id,
      projectId: project1._id,
      invoiceNumber: `INV-${Date.now()}-1`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [{ description: 'Work in Dec', quantity: 40, rate: 2500, amount: 100000 }],
      subtotal: 100000,
      taxRate: 18,
      taxAmount: 18000,
      totalAmount: 118000,
      amountPaid: 118000,
      currency: 'INR',
      status: 'paid'
    });

    await Payment.create({
      userId,
      invoiceId: invoice1._id,
      amount: 118000,
      paymentDate: new Date(),
      paymentMethod: 'bank_transfer'
    });

    console.log(`✅ Created invoice ${invoice1.invoiceNumber} and recorded payment`);

    console.log('\n🎉 Seeding complete! Check your dashboard.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();

