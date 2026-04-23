import { promotionService } from '~/services/promotionService';
import { StatusCodes } from 'http-status-codes';

const createPromotion = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await promotionService.createPromotion(data);
    res.status(StatusCodes.CREATED).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getPromotions = async (req, res, next) => {
  try {
    const query = req.query;
    const result = await promotionService.getPromotions(query);
    res.status(StatusCodes.OK).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getPromotionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await promotionService.getPromotionById(id);
    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Promotion not found' });
    }
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await promotionService.updatePromotion(id, data);
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const id = req.params.id;
    await promotionService.deletePromotion(id);
    res.status(StatusCodes.OK).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const clonePromotion = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await promotionService.clonePromotion(id);
    res.status(StatusCodes.CREATED).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getEligibleOrderPromos = async (req, res, next) => {
  try {
    const { customerId, orderValue } = req.query;
    const result = await promotionService.getEligibleOrderPromotions(customerId, parseFloat(orderValue));
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const applyPromotions = async (req, res, next) => {
  try {
    const { cartItems, items, customerId, orderPromoId, couponCode } = req.body;
    const finalItems = items || cartItems;
    const finalPromoId = orderPromoId || couponCode;
    const result = await promotionService.applyPromotions(finalItems, customerId, finalPromoId);
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const promotionController = {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  clonePromotion,
  getEligibleOrderPromos,
  applyPromotions
};
