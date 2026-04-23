import Promotion from '~/models/promotionModel';
import { computePromoStatus } from '~/utils/computePromoStatus';
import { StatusCodes } from 'http-status-codes';

export const checkPromoEditable = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Promotion not found' });
    }

    const computedStatus = computePromoStatus(promo);

    if (computedStatus === 'ended') {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Cannot update an ended promotion' 
      });
    }

    if (computedStatus === 'active' || computedStatus === 'scheduled') {
      // Restricted fields: status, endDate, isForever, description
      const allowedFields = ['status', 'endDate', 'isForever', 'description'];
      const updates = Object.keys(req.body);
      const isAllowed = updates.every(field => allowedFields.includes(field));

      if (!isAllowed) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: `In ${computedStatus} status, you can only update: ${allowedFields.join(', ')}` 
        });
      }
    }

    // If 'inactive', everything is allowed (already handled by skip)
    
    req.promotion = promo; // Attach for controller use
    next();
  } catch (error) {
    next(error);
  }
};
