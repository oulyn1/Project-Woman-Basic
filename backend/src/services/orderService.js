import { orderModel } from "~/models/orderModel";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { productModel } from "~/models/productModel";
import Promotion from "~/models/promotionModel";
import User from "~/models/userModel";
import { calculateLoyaltyTier } from "~/utils/calculateLoyaltyTier";
import { sendMail } from "~/services/mailService";

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
  };

  // Reserve stock cho từng item — atomic, chặn oversell ngay khi đặt hàng
  const reservedItems = [];
  for (const item of newOrder.items) {
    const productId = item.productId?._id || item.productId;
    const variantId = item.variantId?._id || item.variantId;
    const reserved = await productModel.reserveStock(productId, variantId, item.quantity);
    if (!reserved) {
      // Rollback: hoàn lại stock cho các item đã reserve trước đó
      for (const r of reservedItems) {
        await productModel.releaseStock(r.productId, r.variantId, r.quantity).catch(() => {});
      }
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Sản phẩm không đủ tồn kho để đặt hàng. Vui lòng kiểm tra lại giỏ hàng.`
      );
    }
    reservedItems.push({ productId, variantId, quantity: item.quantity });
  }

  const createdOrder = await orderModel.createNew(newOrder);

  // Increment usage count for promotions
  const promoIdsToIncrement = new Set();
  if (newOrder.appliedOrderPromoId) {
    promoIdsToIncrement.add(newOrder.appliedOrderPromoId.toString());
  }
  (newOrder.items || []).forEach((item) => {
    if (item.appliedPromoId) {
      promoIdsToIncrement.add(item.appliedPromoId.toString());
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
  const getNewOrder = await orderModel.getDetailsWithProducts(createdOrder._id);

  // Gửi mail xác nhận bất đồng bộ để không block response
  const { name, email } = newOrder.buyerInfo;
  const orderId = createdOrder._id.toString();
  const subject = 'Xác nhận đơn hàng của bạn từ Woman Basic';
  const text = `Chào ${name},\n\nCảm ơn bạn đã đặt hàng tại Woman Basic.\nMã đơn hàng của bạn là: ${orderId}\nBạn có thể sử dụng mã đơn hàng này để tra cứu trạng thái đơn hàng của mình trên website.\n\nTrân trọng,\nĐội ngũ Woman Basic`;
  sendMail(email, subject, text).catch((error) => {
    console.error('Error sending confirmation email in background:', error);
  });

  return getNewOrder;
};

const getDetails = async (orderId) => {
  const order = await orderModel.getDetailsWithProducts(orderId);
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  return order;
};

const getAll = async () => {
  // Admin/Staff: luôn trả tất cả đơn hàng. Customer dùng getMyOrders
  const orders = await orderModel.getAllWithProducts({})
  return orders || []
}

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

const updateOne = async (orderId, reqBody, user) => {
  const currentOrder = await orderModel.getDetails(orderId);
  if (!currentOrder)
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");

  // Kiểm tra quyền hạn (Role-based access & ownership validation)
  const isStaffUser = user && (user.role === 'admin' || user.role === 'employee');
  const isOrderOwner = currentOrder.userId && user && currentOrder.userId.toString() === user.userId;

  if (!isStaffUser && !isOrderOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Bạn không có quyền sửa đổi đơn hàng này");
  }

  // Đảm bảo chỉ khách hàng mới được chuyển trạng thái là đã nhận được hàng (delivered) hoặc hoàn hàng (returned), admin không làm được
  if (reqBody.status && ['delivered', 'returned'].includes(reqBody.status)) {
    if (isStaffUser) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Chỉ khách hàng sở hữu đơn hàng mới có quyền xác nhận đã nhận hàng hoặc hoàn hàng. Admin/Nhân viên không thể thực hiện thao tác này.");
    }
  }

  // Khách hàng (không phải staff) chỉ được phép cập nhật trạng thái đơn hàng của mình hoặc thanh toán lại
  if (!isStaffUser) {
    const allowedKeys = ['status', 'paymentStatus'];
    const updateKeys = Object.keys(reqBody);
    const hasInvalidKeys = updateKeys.some(key => !allowedKeys.includes(key));
    if (hasInvalidKeys) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Khách hàng chỉ được phép cập nhật trạng thái đơn hàng hoặc thanh toán lại");
    }

    if (reqBody.status) {
      if (!['cancelled', 'delivered', 'returned'].includes(reqBody.status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Khách hàng chỉ được phép chuyển trạng thái đơn sang hủy (cancelled), đã nhận (delivered) hoặc hoàn hàng (returned)");
      }

      if (reqBody.status === 'cancelled' && currentOrder.status !== 'pending') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ có thể hủy đơn hàng khi đơn hàng đang ở trạng thái chờ xử lý (pending)");
      }

      if (['delivered', 'returned'].includes(reqBody.status) && currentOrder.status !== 'confirmed') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ có thể chuyển trạng thái sang đã nhận hàng hoặc hoàn hàng khi đơn hàng đã được xác nhận (confirmed)");
      }
    }
  }

  const updateData = { ...reqBody, updatedAt: Date.now() };
  const updatedOrder = await orderModel.updateOne(orderId, updateData);
  if (!updatedOrder)
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found to update");

  // Trả lại lượt dùng khuyến mãi nếu đơn hàng bị hủy
  if (currentOrder.status !== "cancelled" && reqBody.status === "cancelled") {
    const promoIdsToDecrement = new Set();
    if (currentOrder.appliedOrderPromoId) {
      promoIdsToDecrement.add(currentOrder.appliedOrderPromoId.toString());
    }
    (currentOrder.items || []).forEach((item) => {
      if (item.appliedPromoId) {
        promoIdsToDecrement.add(item.appliedPromoId.toString());
      }
    });

    if (promoIdsToDecrement.size > 0) {
      try {
        await Promise.all(
          Array.from(promoIdsToDecrement).map((id) =>
            Promotion.findByIdAndUpdate(id, { $inc: { usageCount: -1 } }),
          ),
        );
      } catch (error) {
        console.warn("⚠️ Failed to decrement promotion usageCount:", error.message);
      }
    }

    // Hoàn lại stock đã reserve khi đặt đơn
    for (const item of currentOrder.items) {
      if (item.productId && item.variantId) {
        await productModel.releaseStock(item.productId, item.variantId, item.quantity)
          .catch((err) => console.warn('⚠️ Failed to release stock on cancel:', err.message));
      }
    }

    // Nếu đơn đã được confirm (sold đã tăng), giảm lại sold
    if (currentOrder.status === 'confirmed') {
      for (const item of currentOrder.items) {
        if (item.productId) {
          await productModel.decrementSold(item.productId, item.quantity)
            .catch((err) => console.warn('⚠️ Failed to decrement sold on cancel:', err.message));
        }
      }
    }
  }

  // Hoàn lại stock + giảm sold khi khách hoàn hàng (returned từ confirmed)
  if (reqBody.status === 'returned' && currentOrder.status === 'confirmed') {
    for (const item of currentOrder.items) {
      if (item.productId && item.variantId) {
        await productModel.releaseStock(item.productId, item.variantId, item.quantity)
          .catch((err) => console.warn('⚠️ Failed to release stock on return:', err.message));
      }
      if (item.productId) {
        await productModel.decrementSold(item.productId, item.quantity)
          .catch((err) => console.warn('⚠️ Failed to decrement sold on return:', err.message));
      }
    }
  }

  // Tính lại Loyalty Tier khi đơn chuyển sang delivered/returned/cancelled
  const loyaltyTriggerStatuses = ['delivered', 'returned', 'cancelled'];
  const isStatusChanged = reqBody.status && reqBody.status !== currentOrder.status;
  if (isStatusChanged && loyaltyTriggerStatuses.includes(reqBody.status) && currentOrder.userId) {
    (async () => {
      try {
        // Lấy tất cả đơn hàng đã giao (delivered) để tính hạng thành viên
        const userOrders = await orderModel.getAll({
          userId: currentOrder.userId,
          status: "delivered",
        });
        const totalSpending = (userOrders || []).reduce(
          (sum, o) => sum + Number(o?.total || 0),
          0,
        );
        const newTier = calculateLoyaltyTier(totalSpending);
        await User.findByIdAndUpdate(currentOrder.userId, { loyaltyTier: newTier });
      } catch (error) {
        console.warn("⚠️ Failed to update loyalty tier in background:", error.message);
      }
    })();
  }

  return updatedOrder;
};

const confirmOrder = async (orderId) => {
  const order = await orderModel.getDetailsWithProducts(orderId);
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  if (order.status !== "pending")
    throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ đơn pending mới confirm");

  if (!order.items.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Đơn hàng không có sản phẩm hợp lệ để xác nhận",
    );
  }

  // Stock đã được reserve ngay khi tạo đơn — chỉ cần tăng sold và đổi status
  for (const item of order.items) {
    await productModel.incrementSold(item.productId, item.quantity);
  }

  const updatedOrder = await orderModel.updateOne(orderId, {
    status: "confirmed",
    updatedAt: Date.now(),
  });

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
