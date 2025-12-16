const mongoose = require('mongoose');
const User = require('../src/models/user');
const Client = require('../src/models/Client');
const Project = require('../src/models/Project');
const TimeLog = require('../src/models/TimeLog');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freelanceflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedData() {
  try {
    console.log('🌱 Starting to seed sample data...\n');

    // Step 1: Find or create a test user
    let user = await User.findOne({ email: '2024.rajk@isu.ac.in' });
    if (!user) {
      console.log('❌ User not found. Please login first to create a user.');
      process.exit(1);
    }
    console.log('✅ Found user:', user.name);
    const userId = user._id;

    // Step 2: Create Clients
    console.log('\n📋 Creating Clients...');
    
    const client1 = await Client.create({
      userId,
      clientType: 'Company',
      name: 'TechStart Solutions',
      company: 'TechStart Solutions Pvt Ltd',
      email: 'contact@techstart.com',
      phone: '+91-9876543210',
      website: 'https://techstart.com',
      billingAddress: {
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      },
      taxId: 'GSTIN123456789',
      currency: 'INR',
      defaultHourlyRate: 2500,
      status: 'Active'
    });
    console.log('✅ Created client: TechStart Solutions');

    const client2 = await Client.create({
      userId,
      clientType: 'Individual',
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91-9123456789',
      billingAddress: {
        street: '45 Park Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      currency: 'INR',
      defaultHourlyRate: 1500,
      status: 'Active'
    });
    console.log('✅ Created client: Priya Sharma');

    const client3 = await Client.create({
      userId,
      clientType: 'Company',
      name: 'Global Enterprises',
      company: 'Global Enterprises LLC',
      email: 'info@globalent.com',
      phone: '+1-555-0123',
      website: 'https://globalenterprises.com',
      billingAddress: {
        street: '789 Silicon Valley Blvd',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94105',
        country: 'USA'
      },
      taxId: 'EIN-12-3456789',
      currency: 'USD',
      defaultHourlyRate: 150,
      status: 'Active'
    });
    console.log('✅ Created client: Global Enterprises');

    // Step 3: Create Projects
    console.log('\n🚀 Creating Projects...');

    const project1 = await Project.create({
      userId,
      clientId: client1._id,
      title: 'E-commerce Website Development',
      description: 'Build a full-featured e-commerce platform with payment integration',
      billingType: 'Hourly',
      hourlyRate: 2500,
      startDate: new Date('2024-11-01'),
      deadline: new Date('2025-02-28'),
      status: 'active'
    });
    console.log('✅ Created project: E-commerce Website (Hourly @ ₹2500/hr)');

    const project2 = await Project.create({
      userId,
      clientId: client2._id,
      title: 'Personal Portfolio Website',
      description: 'Design and develop a modern portfolio website',
      billingType: 'Fixed',
      fixedPrice: 35000,
      startDate: new Date('2024-12-01'),
      deadline: new Date('2024-12-31'),
      status: 'active'
    });
    console.log('✅ Created project: Portfolio Website (Fixed @ ₹35,000)');

    const project3 = await Project.create({
      userId,
      clientId: client1._id,
      title: 'Mobile App UI/UX Design',
      description: 'Design user interface and experience for mobile application',
      billingType: 'Hourly',
      hourlyRate: 3000,
      startDate: new Date('2024-12-10'),
      deadline: new Date('2025-01-31'),
      status: 'active'
    });
    console.log('✅ Created project: Mobile App Design (Hourly @ ₹3000/hr)');

    const project4 = await Project.create({
      userId,
      clientId: client3._id,
      title: 'API Integration & Backend',
      description: 'Integrate third-party APIs and build backend services',
      billingType: 'Hourly',
      hourlyRate: 150,
      startDate: new Date('2024-11-15'),
      deadline: new Date('2025-03-15'),
      status: 'active'
    });
    console.log('✅ Created project: API Integration (Hourly @ $150/hr)');

    // Step 4: Log Time (Billable and Non-billable)
    console.log('\n⏱️  Logging Time Entries...');

    const timeLogs = [];

    // Project 1 - E-commerce (Multiple entries, some invoiced, some not)
    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project1._id,
      date: new Date('2024-11-05'),
      hours: 8,
      description: 'Setup project structure and database schema',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project1._id,
      date: new Date('2024-11-08'),
      hours: 6,
      description: 'Developed product catalog and search functionality',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project1._id,
      date: new Date('2024-11-12'),
      hours: 7,
      description: 'Implemented shopping cart and checkout flow',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project1._id,
      date: new Date('2024-11-15'),
      hours: 5,
      description: 'Integrated Razorpay payment gateway',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project1._id,
      date: new Date('2024-11-18'),
      hours: 4,
      description: 'Bug fixes and testing',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project1._id,
      date: new Date('2024-11-20'),
      hours: 2,
      description: 'Team meeting and planning session',
      billable: false,
      invoiced: false
    }));

    console.log('✅ Logged 6 time entries for E-commerce project');

    // Project 3 - Mobile App Design
    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project3._id,
      date: new Date('2024-12-11'),
      hours: 6,
      description: 'Created wireframes and user flow diagrams',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project3._id,
      date: new Date('2024-12-13'),
      hours: 8,
      description: 'Designed main app screens in Figma',
      billable: true,
      invoiced: false
    }));

    console.log('✅ Logged 2 time entries for Mobile App Design');

    // Project 4 - API Integration
    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project4._id,
      date: new Date('2024-11-20'),
      hours: 10,
      description: 'Integrated Stripe and SendGrid APIs',
      billable: true,
      invoiced: false
    }));

    timeLogs.push(await TimeLog.create({
      userId,
      projectId: project4._id,
      date: new Date('2024-11-25'),
      hours: 8,
      description: 'Built REST API endpoints and documentation',
      billable: true,
      invoiced: false
    }));

    console.log('✅ Logged 2 time entries for API Integration');

    // Step 5: Create Invoices
    console.log('\n💰 Creating Invoices...');

    // Invoice 1 - For first 3 time logs of Project 1 (PAID)
    const invoice1TimeLogs = timeLogs.slice(0, 3);
    const invoice1Items = invoice1TimeLogs.map(log => ({
      description: log.description,
      quantity: log.hours,
      rate: project1.hourlyRate,
      amount: log.hours * project1.hourlyRate,
      timeLogId: log._id
    }));

    const invoice1Subtotal = invoice1Items.reduce((sum, item) => sum + item.amount, 0);
    const invoice1TaxRate = 18;
    const invoice1TaxAmount = invoice1Subtotal * (invoice1TaxRate / 100);
    const invoice1Total = invoice1Subtotal + invoice1TaxAmount;

    const invoice1 = await Invoice.create({
      userId,
      clientId: client1._id,
      projectId: project1._id,
      invoiceNumber: 'INV-2024-001',
      issueDate: new Date('2024-11-20'),
      dueDate: new Date('2024-12-20'),
      items: invoice1Items,
      subtotal: invoice1Subtotal,
      taxRate: invoice1TaxRate,
      taxAmount: invoice1TaxAmount,
      discountAmount: 0,
      totalAmount: invoice1Total,
      amountPaid: invoice1Total,
      currency: 'INR',
      status: 'paid',
      notes: 'Thank you for your business!'
    });

    // Mark time logs as invoiced
    await TimeLog.updateMany(
      { _id: { $in: invoice1TimeLogs.map(l => l._id) } },
      { invoiced: true, invoiceId: invoice1._id }
    );

    console.log(`✅ Invoice #${invoice1.invoiceNumber} - ₹${invoice1Total.toFixed(2)} (PAID)`);

    // Invoice 2 - Fixed price project (PARTIAL PAYMENT)
    const invoice2Subtotal = project2.fixedPrice;
    const invoice2TaxRate = 18;
    const invoice2TaxAmount = invoice2Subtotal * (invoice2TaxRate / 100);
    const invoice2Discount = 1000;
    const invoice2Total = invoice2Subtotal + invoice2TaxAmount - invoice2Discount;

    const invoice2 = await Invoice.create({
      userId,
      clientId: client2._id,
      projectId: project2._id,
      invoiceNumber: 'INV-2024-002',
      issueDate: new Date('2024-12-05'),
      dueDate: new Date('2025-01-05'),
      items: [{
        description: 'Personal Portfolio Website - Complete Development',
        quantity: 1,
        rate: project2.fixedPrice,
        amount: project2.fixedPrice
      }],
      subtotal: invoice2Subtotal,
      taxRate: invoice2TaxRate,
      taxAmount: invoice2TaxAmount,
      discountAmount: invoice2Discount,
      totalAmount: invoice2Total,
      amountPaid: 20000,
      currency: 'INR',
      status: 'partial',
      notes: 'Remaining balance due before project delivery'
    });

    console.log(`✅ Invoice #${invoice2.invoiceNumber} - ₹${invoice2Total.toFixed(2)} (PARTIAL)`);

    // Step 6: Create Payments
    console.log('\n💳 Recording Payments...');

    const payment1 = await Payment.create({
      userId,
      invoiceId: invoice1._id,
      amount: invoice1Total,
      paymentDate: new Date('2024-11-25'),
      paymentMethod: 'bank_transfer',
      referenceNumber: 'TXN123456789',
      notes: 'Received via NEFT transfer'
    });
    console.log(`✅ Payment for Invoice #${invoice1.invoiceNumber} - ₹${invoice1Total.toFixed(2)}`);

    const payment2 = await Payment.create({
      userId,
      invoiceId: invoice2._id,
      amount: 20000,
      paymentDate: new Date('2024-12-10'),
      paymentMethod: 'upi',
      referenceNumber: 'UPI-987654321',
      notes: 'Advance payment - 50% upfront'
    });
    console.log(`✅ Payment for Invoice #${invoice2.invoiceNumber} - ₹20,000 (Partial)`);

    // Summary
    console.log('\n📊 SAMPLE DATA SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Clients: 3`);
    console.log(`✅ Projects: 4`);
    console.log(`✅ Time Logs: 10 (30 billable hrs, 2 non-billable hrs)`);
    console.log(`✅ Invoices: 2 (1 paid, 1 partial)`);
    console.log(`✅ Payments: 2`);
    console.log(`✅ Unbilled Hours: 23 hours available for invoicing`);
    console.log('='.repeat(60));

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to /projects to see all projects');
    console.log('   2. Go to /time to view time logs');
    console.log('   3. Create invoices from unbilled hours');
    console.log('   4. Record payments for partial/unpaid invoices\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
