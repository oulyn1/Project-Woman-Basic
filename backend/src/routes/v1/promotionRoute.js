import express from 'express';
import { promotionController } from '~/controllers/promotionController';
import { checkPromoEditable } from '~/middlewares/checkPromoEditable';

import { authMiddleware } from '~/middlewares/authMiddleware'
import { isStaff } from '~/middlewares/roleMiddleware'

const Router = express.Router();

// CRUD + Search
Router.route('/')
  .get(promotionController.getPromotions)
  .post(authMiddleware, isStaff, promotionController.createPromotion);

Router.route('/:id')
  .get(promotionController.getPromotionById)
  .put(authMiddleware, isStaff, checkPromoEditable, promotionController.updatePromotion)
  .delete(authMiddleware, isStaff, promotionController.deletePromotion);

Router.post('/:id/clone', authMiddleware, isStaff, promotionController.clonePromotion);

// Checkout service
Router.get('/order/eligible', promotionController.getEligibleOrderPromos);
Router.post('/apply', promotionController.applyPromotions);

export const promotionRoute = Router;
