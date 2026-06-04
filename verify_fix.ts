import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import Invoice from './server/src/models/Invoice';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || '';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    // 1. Create a new invoice
    console.log('Creating invoice with 10% discount...');
    const invoice = new Invoice({
      clientName: 'Verification Test Client',
      clientEmail: 'test@example.com',
      clientPhone: '1234567890',
      issuedDate: new Date(),
      discount: 10, // 10%
      items: [
        { description: 'Service A', quantity: 2, price: 1000, priceType: 'flat', total: 0 },
        { description: 'Service B', quantity: 1, price: 500, priceType: 'flat', total: 0 }
      ],
      paymentDetails: {
        bankAccount: '12345',
        upi: 'test@upi',
        ifscCode: 'TEST0001',
        branchName: 'Test Branch',
        scannerImage: 'scanner.png'
      }
    });

    const saved = await invoice.save();
    console.log('Invoice saved successfully.');
    console.log(`Subtotal: ${saved.subTotal} (expected: 2500)`);
    console.log(`Discount Percentage: ${saved.discount}% (expected: 10%)`);
    console.log(`Total Amount: ${saved.totalAmount} (expected: 2250)`);

    if (saved.subTotal !== 2500) {
      throw new Error(`Subtotal mismatch! Expected 2500, got ${saved.subTotal}`);
    }
    if (saved.totalAmount !== 2250) {
      throw new Error(`Total amount mismatch! Expected 2250, got ${saved.totalAmount}`);
    }

    // 2. Update the invoice to 20% discount
    console.log('Updating invoice to 20% discount...');
    saved.discount = 20;
    const updated = await saved.save();
    console.log('Invoice updated successfully.');
    console.log(`Subtotal: ${updated.subTotal} (expected: 2500)`);
    console.log(`Discount Percentage: ${updated.discount}% (expected: 20%)`);
    console.log(`Total Amount: ${updated.totalAmount} (expected: 2000)`);

    if (updated.totalAmount !== 2000) {
      throw new Error(`Total amount mismatch after update! Expected 2000, got ${updated.totalAmount}`);
    }

    // 3. Cleanup
    console.log('Cleaning up test invoice...');
    await Invoice.findByIdAndDelete(saved._id);
    console.log('Cleanup complete.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    console.log('Backend verification PASSED successfully!');
  } catch (err) {
    console.error('Verification script failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();
