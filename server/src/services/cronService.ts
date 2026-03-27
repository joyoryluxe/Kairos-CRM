import cron from 'node-cron';
import Maternity from '../models/Maternity';
import CorporateEvent from '../models/CorporateEvent';
import Influencer from '../models/Influencer';
import Lead from '../models/Lead';
import Edit from '../models/Edit';
import NotificationLog from '../models/NotificationLog';
import { emailService } from './emailService';

const ADMIN_EMAIL = 'kairosstudio45@gmail.com';

class CronService {
    /**
     * Initialize all cron jobs
     */
    init() {
        // Run every minute
        cron.schedule('* * * * *', async () => {
            console.log('Running per-minute email reminder jobs...');
            await this.checkShootReminders();
            await this.checkDeadlineReminders();
            await this.checkBirthdayReminders();
            await this.checkLeadAndEditReminders();
        });

        console.log('Cron Service initialized successfully');
    }

    /**
     * Helper to check if a notification was already sent
     */
    private async shouldSend(recordId: any, type: string, meta?: any): Promise<boolean> {
        const query: any = { recordId, type };
        if (meta?.dateKey) query['meta.dateKey'] = meta.dateKey;
        if (meta?.year) query['meta.year'] = meta.year;

        const existing = await NotificationLog.findOne(query);
        return !existing;
    }

    /**
     * Helper to log a sent notification
     */
    private async logSent(recordId: any, modelName: string, type: string, meta?: any) {
        await NotificationLog.create({
            recordId,
            modelName,
            type,
            meta
        });
    }

    /**
     * Check for shoots happening tomorrow
     */
    private async checkShootReminders() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
        const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));
        const dateKey = new Date().toISOString().split('T')[0];

        const models = [
            { model: Maternity, field: 'shootDateAndTime', nameField: 'babyName', modelName: 'Maternity' },
            { model: CorporateEvent, field: 'eventDateAndTime', nameField: 'eventName', modelName: 'CorporateEvent' },
            { model: Influencer, field: 'shootDateAndTime', nameField: 'shootName', modelName: 'Influencer' }
        ];

        for (const { model, field, nameField, modelName } of models) {
            const records = await (model as any).find({
                [field]: { $gte: startOfTomorrow, $lte: endOfTomorrow }
            });

            for (const record of records) {
                const type = `shoot-reminder-${field}`;
                if (await this.shouldSend(record._id, type, { dateKey })) {
                    await emailService.sendEmail({
                        to: ADMIN_EMAIL,
                        subject: `Shoot Reminder: ${record.clientName} tomorrow!`,
                        template: 'shoot-reminder',
                        context: {
                            clientName: record.clientName!,
                            shootName: (record as any)[nameField] || 'your shoot',
                            shootDate: record[field].toLocaleString(),
                            location: (record as any).address ? `${record.address.city}, ${record.address.state}` : ''
                        }
                    });
                    await this.logSent(record._id, modelName, type, { dateKey });
                }
            }
        }
    }

    /**
     * Check for deadlines approaching in 1-3 days
     */
    private async checkDeadlineReminders() {
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];

        // Check for 1, 2, and 3 days before
        for (let i = 1; i <= 3; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + i);
            const startOfTarget = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfTarget = new Date(targetDate.setHours(23, 59, 59, 999));

            const models = [
                { model: Maternity, nameField: 'babyName', modelName: 'Maternity' },
                { model: CorporateEvent, nameField: 'eventName', modelName: 'CorporateEvent' },
                { model: Influencer, nameField: 'shootName', modelName: 'Influencer' }
            ];

            for (const { model, nameField, modelName } of models) {
                const records = await (model as any).find({
                    deliveryDeadline: { $gte: startOfTarget, $lte: endOfTarget }
                });

                for (const record of records) {
                    const type = `deadline-countdown-${i}`;
                    if (await this.shouldSend(record._id, type, { dateKey })) {
                        await emailService.sendEmail({
                            to: ADMIN_EMAIL,
                            subject: `Deadline Reminder: ${record.clientName} in ${i} days`,
                            template: 'deadline-reminder',
                            context: {
                                clientName: record.clientName!,
                                shootName: (record as any)[nameField] || 'the project',
                                deadlineDate: record.deliveryDeadline.toLocaleDateString(),
                                daysRemaining: i
                            }
                        });
                        await this.logSent(record._id, modelName, type, { dateKey });
                    }
                }
            }
        }
    }

    /**
     * Check for birthdays today and in the next 7 days
     */
    private async checkBirthdayReminders() {
        const today = new Date();

        // Check for today (i=0) and the next 7 days (i=1 to 7)
        for (let i = 0; i <= 7; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + i);
            const month = targetDate.getMonth() + 1;
            const day = targetDate.getDate();
            const year = today.getFullYear();

            // Birthdays are only in Maternity model currently
            const records = await Maternity.find({
                birthDate: { $exists: true }
            });

            for (const record of records) {
                if (record.birthDate) {
                    const bDate = new Date(record.birthDate);
                    if (bDate.getMonth() + 1 === month && bDate.getDate() === day) {
                        if (i === 0) {
                            // Actual birthday today
                            const type = 'birthday-reminder';
                            if (await this.shouldSend(record._id, type, { year })) {
                                await emailService.sendEmail({
                                    to: ADMIN_EMAIL,
                                    subject: `Birthday Reminder: ${record.babyName || record.clientName} 🎂`,
                                    template: 'birthday-reminder',
                                    context: {
                                        clientName: record.clientName!,
                                        babyName: record.babyName || 'Baby'
                                    }
                                });
                                await this.logSent(record._id, 'Maternity', type, { year });
                            }
                        } else {
                            // Countdown reminder
                            const type = `birthday-countdown-${i}`;
                            const dateKey = today.toISOString().split('T')[0]; // Sent today for a birthday in i days
                            if (await this.shouldSend(record._id, type, { dateKey })) {
                                await emailService.sendEmail({
                                    to: ADMIN_EMAIL,
                                    subject: `Upcoming Birthday: ${record.babyName || record.clientName} in ${i} days!`,
                                    template: 'admin-notification',
                                    context: {
                                        title: 'Upcoming Birthday Reminder',
                                        message: `${record.babyName || 'Baby'} (Client: ${record.clientName}) has a birthday in ${i} days.`,
                                        details: [
                                            { label: 'Baby Name', value: record.babyName || 'N/A' },
                                            { label: 'Client', value: record.clientName },
                                            { label: 'Birthday', value: bDate.toLocaleDateString() },
                                            { label: 'Days Remaining', value: `${i} days` }
                                        ]
                                    }
                                });
                                await this.logSent(record._id, 'Maternity', type, { dateKey });
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Check for Lead and Edit reminders (Status changes and Deadlines)
     */
    private async checkLeadAndEditReminders() {
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];

        // 1. Leads: Booked Recently (Status update)
        const bookedLeads = await Lead.find({
            status: 'Booked',
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Booked in last 24h
        });

        for (const lead of bookedLeads) {
            const type = `lead-status-booked`;
            if (await this.shouldSend(lead._id, type, { dateKey })) {
                await emailService.sendEmail({
                    to: ADMIN_EMAIL,
                    subject: `Lead Confirmed: ${lead.clientName}`,
                    template: 'admin-notification',
                    context: {
                        title: 'Lead Status: Booked',
                        message: `${lead.clientName} has confirmed their booking!`,
                        details: [
                            { label: 'Client', value: lead.clientName },
                            { label: 'Event Type', value: lead.eventType },
                            { label: 'Event Date', value: lead.eventDate ? lead.eventDate.toLocaleDateString() : 'N/A' }
                        ]
                    }
                });
                await this.logSent(lead._id, 'Lead', type, { dateKey });
            }
        }

        // 2. Leads: Follow-up Countdown (3, 2, 1 days)
        for (let i = 1; i <= 3; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + i);
            const startOfTarget = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfTarget = new Date(targetDate.setHours(23, 59, 59, 999));

            const followUpLeads = await Lead.find({
                nextFollowUpDate: { $gte: startOfTarget, $lte: endOfTarget },
                status: { $nin: ['Booked', 'Lost'] } // Only follow up on active potentials
            });

            for (const lead of followUpLeads) {
                const type = `lead-followup-countdown-${i}`;
                if (await this.shouldSend(lead._id, type, { dateKey })) {
                    await emailService.sendEmail({
                        to: ADMIN_EMAIL,
                        subject: `Lead Follow-up: ${lead.clientName} in ${i} days`,
                        template: 'admin-notification',
                        context: {
                            title: 'Lead Follow-up Reminder',
                            message: `Time to follow up with ${lead.clientName} in ${i} days.`,
                            details: [
                                { label: 'Client', value: lead.clientName },
                                { label: 'Phone', value: lead.phoneNumber },
                                { label: 'Status', value: lead.status },
                                { label: 'Follow-up Date', value: lead.nextFollowUpDate!.toLocaleDateString() }
                            ]
                        }
                    });
                    await this.logSent(lead._id, 'Lead', type, { dateKey });
                }
            }
        }

        // 3. Edits: Done Recently
        const finishedEdits = await Edit.find({
            status: 'Done',
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        for (const edit of finishedEdits) {
            const type = `edit-status-done`;
            if (await this.shouldSend(edit._id, type, { dateKey })) {
                await emailService.sendEmail({
                    to: ADMIN_EMAIL,
                    subject: `Edit Finished: ${edit.title}`,
                    template: 'admin-notification',
                    context: {
                        title: 'Edit Status: Done',
                        message: `The editing for project "${edit.title}" for ${edit.clientName} is now complete.`,
                        details: [
                            { label: 'Project', value: edit.title },
                            { label: 'Client', value: edit.clientName },
                            { label: 'Status', value: edit.status }
                        ]
                    }
                });
                await this.logSent(edit._id, 'Edit', type, { dateKey });
            }
        }

        // 4. Edits: Deadline Countdown (3, 2, 1 days)
        for (let i = 1; i <= 3; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + i);
            const startOfTarget = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfTarget = new Date(targetDate.setHours(23, 59, 59, 999));

            const pendingEdits = await Edit.find({
                deadline: { $gte: startOfTarget, $lte: endOfTarget },
                status: { $nin: ['Done', 'Delivered'] }
            });

            for (const edit of pendingEdits) {
                const type = `edit-deadline-countdown-${i}`;
                if (await this.shouldSend(edit._id, type, { dateKey })) {
                    await emailService.sendEmail({
                        to: ADMIN_EMAIL,
                        subject: `Edit Deadline: ${edit.title} in ${i} days`,
                        template: 'admin-notification',
                        context: {
                            title: 'Edit Project Deadline Reminder',
                            message: `The deadline for edit project "${edit.title}" is in ${i} days.`,
                            details: [
                                { label: 'Project', value: edit.title },
                                { label: 'Client', value: edit.clientName },
                                { label: 'Deadline', value: edit.deadline.toLocaleDateString() },
                                { label: 'Priority', value: edit.priority }
                            ]
                        }
                    });
                    await this.logSent(edit._id, 'Edit', type, { dateKey });
                }
            }
        }
    }
}

export const cronService = new CronService();
