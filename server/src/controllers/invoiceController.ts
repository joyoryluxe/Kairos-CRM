import { Response } from 'express';
import Invoice from '../models/Invoice';
import { AuthRequest } from '../middleware/authenticate';

// ─── Create a new Invoice ─────────────────────────────────────────────────────
// Generates a sequential invoice number like KS-001, KS-002, etc.
export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Determine the next invoice number based on the last created invoice
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/KS-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const invoiceNumber = `KS-${String(nextNum).padStart(3, '0')}`;

    const newInvoice = new Invoice({
      ...req.body,
      invoiceNumber, // Force the auto-generated number
    });

    await newInvoice.save();

    res.status(201).json({ success: true, data: newInvoice });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get all Invoices ─────────────────────────────────────────────────────────
// Support filtering by clientName, invoiceNumber, clientPhone and date range
export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientName, invoiceNumber, clientPhone, dateFrom, dateTo } = req.query;
    const filter: Record<string, any> = {};

    if (clientName) {
      filter.clientName = { $regex: clientName as string, $options: 'i' };
    }
    if (invoiceNumber) {
      filter.invoiceNumber = { $regex: invoiceNumber as string, $options: 'i' };
    }
    if (clientPhone) {
      filter.clientPhone = { $regex: clientPhone as string, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      filter.issuedDate = {};
      if (dateFrom) filter.issuedDate.$gte = new Date(dateFrom as string);
      if (dateTo) filter.issuedDate.$lte = new Date(dateTo as string);
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

    // Financial summaries
    const summary = {
      totalCount: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    };

    res.status(200).json({ success: true, summary, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Invoice by ID ────────────────────────────────────────────────────────
export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update an Invoice ────────────────────────────────────────────────────────
export const updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    // Do not allow overriding the invoiceNumber from req.body to maintain integrity
    delete req.body.invoiceNumber;

    Object.assign(invoice, req.body);
    await invoice.save(); // triggers calculations in pre-save hook

    res.status(200).json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete an Invoice ────────────────────────────────────────────────────────
export const deleteInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
