import { orderModel } from "~/models/orderModel";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { productModel } from "~/models/productModel";
import Promotion from "~/models/promotionModel";
import User from "~/models/userModel";
import { calculateLoyaltyTier } from "~/utils/calculateLoyaltyTier";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.toString) return value.toString();
  return String(value);
};

const createNew = async (reqBody, userFromToken) => {
  const newOrder = {
    userId: reqBody.userId || userFromToken?._id || userFromToken?.id || null,
    buyerInfo: reqBody.buyerInfo,
    items: (reqBody.items || []).map((item) => ({
      ...item,
      appliedPromoId: item.appliedPromo?._id || item.appliedPromoId || null,
    })),
    originalSubtotal: reqBody.originalSubtotal,
    totalItemDiscount: reqBody.totalItemDiscount,
    orderDiscount: reqBody.orderDiscount,
    appliedOrderPromoId: reqBody.appliedOrderPromoId,
    total: reqBody.total,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const createdOrder = await orderModel.createNew(newOrder);

  // Increment usage count for promotions
  const promoIdsToIncrement = new Set();
  if (newOrder.appliedOrderPromoId) {
    promoIdsToIncrement.add(newOrder.appliedOrderPromoId.toString());
  }
  (newOrder.items || []).forEach((item) => {
    if (item.appliedPromo && item.appliedPromo._id) {
      promoIdsToIncrement.add(item.appliedPromo._id.toString());
    }
  });

  if (promoIdsToIncrement.size > 0) {
    await Promise.all(
      Array.from(promoIdsToIncrement).map((id) =>
        Promotion.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }),
      ),
    );
  }

  // Trả về chi tiết order kèm product info
  // Trả về chi tiết order kèm product info
  const getNewOrder = await orderModel.getDetailsWithProducts(createdOrder._id);
  return getNewOrder;
};

const getDetails = async (orderId) => {
  const order = await orderModel.getDetailsWithProducts(orderId);
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  return order;
};

const getAll = async (user) => {
  const filter = {};
  if (user?._id || user?.id) filter.userId = user._id || user.id;

  const orders = await orderModel.getAllWithProducts(filter);
  return orders || [];
};

const deleteOne = async (orderId) => {
  const result = await orderModel.deleteOne(orderId);
  if (!result || result.deletedCount === 0)
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  return result;
};

export const search = async (keyword) => {
  const orders = await orderModel.search(keyword);
  // Trả về mảng rỗng nếu không tìm thấy order
  return orders;
};

const updateOne = async (orderId, reqBody) => {
  const updateData = { ...reqBody, updatedAt: Date.now() };
  const updatedOrder = await orderModel.updateOne(orderId, updateData);
  if (!updatedOrder)
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found to update");
  return updatedOrder;
};

const confirmOrder = async (orderId) => {
  // Lấy chi tiết đơn hàng
  const order = await orderModel.getDetailsWithProducts(orderId);
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  if (order.status !== "pending")
    throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ đơn pending mới confirm");

  // Pre-check biến thể và tồn kho đúng theo item trong đơn
  await Promise.all(
    order.items.map(async (item) => {
      if (!item.variantId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Thiếu variantId cho sản phẩm ${item.product?.name || item.productId}`,
        );
      }

      const product = await productModel.getDetails(item.productId);
      if (!product) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Không tìm thấy sản phẩm ${item.product?.name || item.productId}`,
        );
      }

      const targetVariant = (product.variants || []).find(
        (variant) => normalizeId(variant._id) === normalizeId(item.variantId),
      );

      if (!targetVariant) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Biến thể không hợp lệ cho sản phẩm ${item.product?.name || item.productId}`,
        );
      }

      if (item.size && targetVariant.size !== item.size) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Sai kích thước biến thể cho sản phẩm ${item.product?.name || item.productId}`,
        );
      }

      const variantColorName = targetVariant.color?.name || targetVariant.color;
      if (item.color && variantColorName !== item.color) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Sai màu biến thể cho sản phẩm ${item.product?.name || item.productId}`,
        );
      }

      if ((targetVariant.stock || 0) < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Không đủ tồn kho cho sản phẩm ${item.product?.name || item.productId}`,
        );
      }
    }),
  );

  if (!order.items.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Đơn hàng không có sản phẩm hợp lệ để xác nhận",
    );
  }

  // Trừ stock theo đúng variantId của từng item
  for (const item of order.items) {
    const updatedProduct = await productModel.updateVariantStock(
      item.productId,
      item.variantId,
      item.quantity,
    );

    if (!updatedProduct) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Không đủ tồn kho cho sản phẩm ${item.product?.name || item.productId}`,
      );
    }
  }

  // Cập nhật trạng thái đơn hàng
  const updatedOrder = await orderModel.updateOne(orderId, {
    status: "confirmed",
    updatedAt: Date.now(),
  });

  // Update loyalty tier cho user nếu có userId
  if (order.userId) {
    try {
      // Lấy tất cả confirmed orders của user để tính tổng chi tiêu
      const userOrders = await orderModel.getAll({
        userId: order.userId,
        status: "confirmed",
      });
      const totalSpending = (userOrders || []).reduce(
        (sum, o) => sum + Number(o?.total || 0),
        0,
      );

      // Tính tier mới
      const newTier = calculateLoyaltyTier(totalSpending);

      // Update user với tier mới
      await User.findByIdAndUpdate(order.userId, { loyaltyTier: newTier });
    } catch (error) {
      // Log error nhưng không throw, vì order đã confirm thành công
      console.warn("⚠️ Failed to update loyalty tier:", error.message);
    }
  }

  // Trả về chi tiết order mới nhất
  return updatedOrder || (await orderModel.getDetailsWithProducts(orderId));
};

const getMyOrders = async (userId) => {
  if (!userId)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not logged in");

  const orders = await orderModel.getAllWithProducts({ userId });
  return orders || [];
};

const searchMyOrders = async (userId, keyword) => {
  if (!userId)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not logged in");

  const orders = await orderModel.searchByUser(userId, keyword);
  return orders || [];
};

export const orderService = {
  createNew,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne,
  confirmOrder,
  getMyOrders,
  searchMyOrders,
};
