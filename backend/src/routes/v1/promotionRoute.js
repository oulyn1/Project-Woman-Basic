import express from 'express';
import { promotionController } from '~/controllers/promotionController';
import { checkPromoEditable } from '~/middlewares/checkPromoEditable';

const Router = express.Router();

// CRUD + Search
Router.route('/')
  .get(promotionController.getPromotions)
  .post(promotionController.createPromotion);

Router.route('/:id')
  .get(promotionController.getPromotionById)
  .put(checkPromoEditable, promotionController.updatePromotion)
  .delete(promotionController.deletePromotion);

Router.post('/:id/clone', promotionController.clonePromotion);

// Checkout service
Router.get('/order/eligible', promotionController.getEligibleOrderPromos);
Router.post('/apply', promotionController.applyPromotions);

export const promotionRoute = Router;
