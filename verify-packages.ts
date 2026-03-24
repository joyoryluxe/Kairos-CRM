import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Package from './server/src/models/Package';
import Maternity from './server/src/models/Maternity';
import Influencer from './server/src/models/Influencer';
import CorporateEvent from './server/src/models/CorporateEvent';

dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kairos-crm';

async function runTest() {
  try {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Setup test packages
    await Package.deleteMany({ name: /^Test / });
    
    const matPkg = await Package.create({
      name: 'Test Maternity Pkg',
      category: 'Maternity',
      price: 12345,
      isActive: true
    });
    
    const infPkg = await Package.create({
      name: 'Test Influencer Pkg',
      category: 'Influencer',
      price: 54321,
      isActive: true
    });

    const corpPkg = await Package.create({
      name: 'Test Corporate Pkg',
      category: 'Corporate',
      price: 99999,
      isActive: true
    });

    console.log('Test packages created');

    // 2. Test Maternity Auto-fill
    console.log('Testing Maternity...');
    const m = new Maternity({
      clientName: 'Test Client',
      phoneNumber: '1234567890',
      package: 'Test Maternity Pkg'
    });
    await m.save();
    console.log(`Maternity Price Auto-filled: ${m.packagePrice} (Expected: 12345)`);
    if (m.packagePrice !== 12345) throw new Error('Maternity price mismatch');

    // 3. Test Influencer Auto-fill
    console.log('Testing Influencer...');
    const i = new Influencer({
      clientName: 'Test Influencer',
      phoneNumber: '0987654321',
      package: 'Test Influencer Pkg'
    });
    await i.save();
    console.log(`Influencer Price Auto-filled: ${i.packagePrice} (Expected: 54321)`);
    if (i.packagePrice !== 54321) throw new Error('Influencer price mismatch');

    // 4. Test Corporate Auto-fill
    console.log('Testing Corporate...');
    const c = new CorporateEvent({
      clientName: 'Test Corp',
      phoneNumber: '1122334455',
      package: 'Test Corporate Pkg'
    });
    await c.save();
    console.log(`Corporate Price Auto-filled: ${c.packagePrice} (Expected: 99999)`);
    if (c.packagePrice !== 99999) throw new Error('Corporate price mismatch');

    // 5. Cleanup
    await Package.deleteMany({ name: /^Test / });
    await Maternity.deleteMany({ clientName: 'Test Client' });
    await Influencer.deleteMany({ clientName: 'Test Influencer' });
    await CorporateEvent.deleteMany({ clientName: 'Test Corp' });

    console.log('Verification successful!');
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

runTest();
