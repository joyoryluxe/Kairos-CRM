import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import Maternity from '../models/Maternity';
import Influencer from '../models/Influencer';
import CorporateEvent from '../models/CorporateEvent';
import Lead from '../models/Lead';
import Edit from '../models/Edit';

const modelMap: Record<string, any> = {
  maternity: Maternity,
  influencer: Influencer,
  corporate: CorporateEvent,
  lead: Lead,
  edit: Edit,
};

export const getFieldSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { model, field } = req.params;
    const { q = '' } = req.query;

    const Model = modelMap[model.toLowerCase()];
    if (!Model) {
      res.status(400).json({ success: false, message: 'Invalid model' });
      return;
    }

    // We want to find unique values for the field that match the query 'q'
    // Mongoose 'distinct' doesn't support regex directly in the same way 'find' does.
    // So we'll find matching records and then get distinct values, or use an aggregation.
    
    // Aggregation pipeline is more efficient for this
    const suggestions = await Model.aggregate([
      {
        $match: {
          [field]: { $regex: q, $options: 'i' }
        }
      },
      {
        $group: {
          _id: `$${field}`
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          value: '$_id'
        }
      }
    ]);

    const result = suggestions
      .map((s: any) => s.value)
      .filter((v: any) => v != null && v !== '');

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
