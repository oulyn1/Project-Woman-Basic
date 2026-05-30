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
    // ✅ FIX LỖI 17: Xóa createdAt/updatedAt thủ công
    // orderSchema đã có timestamps:true → Mongoose tự quản lý, không cần set thủ công
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
  const getNewOrder = await orderModel.getDetailsWithProducts(createdOrder._id);

  // ✅ OPTIMIZATION: Gửi mail bất đồng bộ (không await) để tránh block response của khách hàng (giảm 1-2s delay)
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
  // ✅ FIX: getAll dùng cho Admin/Staff → luôn trả tất cả đơn hàng (không filter theo userId)
  // Customer dùng getMyOrders riêng có filter theo userId
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

  // Khách hàng (không phải staff) chỉ được phép hủy đơn hàng của mình khi đơn đang ở trạng thái pending
  if (!isStaffUser) {
    const allowedKeys = ['status', 'paymentStatus'];
    const updateKeys = Object.keys(reqBody);
    const hasInvalidKeys = updateKeys.some(key => !allowedKeys.includes(key));
    if (hasInvalidKeys) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Khách hàng chỉ được phép hủy đơn hàng hoặc thanh toán lại");
    }

    if (reqBody.status && reqBody.status !== 'cancelled') {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Khách hàng chỉ được phép chuyển trạng thái đơn sang hủy");
    }

    if (reqBody.status === 'cancelled' && currentOrder.status !== 'pending') {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ có thể hủy đơn hàng khi đơn hàng đang ở trạng thái chờ xử lý (pending)");
    }
  }

  const updateData = { ...reqBody, updatedAt: Date.now() };
  const updatedOrder = await orderModel.updateOne(orderId, updateData);
  if (!updatedOrder)
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found to update");

  // ✅ FIX: Trả lại lượt dùng khuyến mãi nếu đơn hàng bị hủy
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

    // Nếu đơn đã được confirmed và có userId, tính toán lại Loyalty Tier của User ngầm ở background
    if (currentOrder.status === "confirmed" && currentOrder.userId) {
      (async () => {
        try {
          const userOrders = await orderModel.getAll({
            userId: currentOrder.userId,
            status: "confirmed",
          });
          const totalSpending = (userOrders || []).reduce(
            (sum, o) => sum + Number(o?.total || 0),
            0,
          );
          const newTier = calculateLoyaltyTier(totalSpending);
          await User.findByIdAndUpdate(currentOrder.userId, { loyaltyTier: newTier });
        } catch (error) {
          console.warn("⚠️ Failed to update loyalty tier after cancellation:", error.message);
        }
      })();
    }
  }

  return updatedOrder;
};

const confirmOrder = async (orderId) => {
  // Lấy chi tiết đơn hàng
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

  // ✅ OPTIMIZATION: Lấy tất cả sản phẩm trong 1 query duy nhất bằng $in thay vì gọi DB từng sản phẩm trong loop RTT
  const productIds = order.items.map(item => item.productId.toString());
  const products = await productModel.findManyByIds(productIds);

  // Pre-check biến thể và tồn kho đúng theo item trong đơn (Trong bộ nhớ)
  order.items.forEach((item) => {
    if (!item.variantId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Thiếu variantId cho sản phẩm ${item.product?.name || item.productId}`,
      );
    }

    const product = products.find(p => p._id.toString() === item.productId.toString());
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
  });

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

  // ✅ OPTIMIZATION: Tính toán và cập nhật Loyalty Tier của User bất đồng bộ ở background, không block response xác nhận đơn hàng
  if (order.userId) {
    (async () => {
      try {
        const userOrders = await orderModel.getAll({
          userId: order.userId,
          status: "confirmed",
        });
        const totalSpending = (userOrders || []).reduce(
          (sum, o) => sum + Number(o?.total || 0),
          0,
        );

        const newTier = calculateLoyaltyTier(totalSpending);
        await User.findByIdAndUpdate(order.userId, { loyaltyTier: newTier });
      } catch (error) {
        console.warn("⚠️ Failed to update loyalty tier in background:", error.message);
      }
    })();
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
