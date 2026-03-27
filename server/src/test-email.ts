import { emailService } from './services/emailService';
import dotenv from 'dotenv';
import path from 'path';

// Load env explicitly for independent script
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testEmail() {
  console.log('Testing Email Service...');

  const ok = await emailService.verifyConnection();
  if (!ok) {
    console.error('SMTP Connection failed. Please check your .env settings.');
    return;
  }

  try {
    // Note: This will only work if you have a valid SMTP_PASS in .env
    // For testing, you can use a real email to address
    await emailService.sendEmail({
      to: 'joyory.parthiv@gmail.com',
      subject: 'KAIROS CRM - Shoot Reminder Test',
      template: 'shoot-reminder',
      context: {
        clientName: 'John Doe',
        shootName: 'Maternity Session',
        shootDate: new Date().toLocaleString(),
        location: 'Studio A'
      }
    });
    console.log('Shoot reminder test triggered!');

    await emailService.sendEmail({
      to: 'joyory.parthiv@gmail.com',
      subject: 'KAIROS CRM - Admin Notification Test',
      template: 'admin-notification',
      context: {
        title: 'Lead Status: Booked',
        message: 'A new lead has been confirmed!',
        details: [
          { label: 'Client', value: 'Jane Smith' },
          { label: 'Event Type', value: 'Wedding' },
          { label: 'Status', value: 'Booked' }
        ]
      }
    });
    console.log('Admin notification test triggered!');
    console.log('Test email triggered successfully!');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail();
