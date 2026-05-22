import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minLength: 6 },
    role: {
      type: String,
      enum: ["customer", "employee", "admin"],
      default: "customer",
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    loyaltyTier: {
      type: String,
      enum: ["Standard", "Silver", "Gold", "Platinum"],
      default: "Standard",
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },

    // === Recommendation Engine ===
    // Điểm sở thích theo danh mục (key = categoryId dạng string)
    categoryScores: {
      type: Map,
      of: Number,
      default: {}
    },

    // 50 sự kiện hành vi gần nhất (để AI phân tích pattern)
    behaviorEvents: [
      {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        action:     { type: String, enum: ['view', 'add_to_cart', 'purchase'] },
        score:      { type: Number },
        createdAt:  { type: Date, default: Date.now }
      }
    ]
    // Giới hạn 50 events dùng $push + $slice khi update (xem behaviorTracking.service)
  },
  {
    timestamps: true,
    collection: "users",
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// Legacy compatibility wrapper
export const userModel = {
  USER_COLLECTION_NAME: "users",

  createNew: async (data) => {
    const user = new User(data);
    return await user.save();
  },

  findByEmail: async (email) => {
    return await User.findOne({ email });
  },

  findOneId: async (id) => {
    return await User.findById(id).select("-password").lean();
  },

  updateOne: async (userId, updateData) => {
    // If password is being updated, we need to hash it if we use findOneAndUpdate
    // OR we just use find + save
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after' },
    );
  },

  getAll: async () => {
    return await User.find().select("-password").lean();
  },

  search: async (query) => {
    const regex = new RegExp(query, "i");
    return await User.find({ name: regex }).select("-password").lean();
  },

  employee: async (query) => {
    // ✅ FIX LỖI 12: role là enum field, dùng exact match thay vì regex
    // Regex trên enum có thể match partial string, ví dụ 'employee' match cả các case không mong muốn
    const role = query.trim()
    return await User.find({ role }).select("-password").lean()
  },

  searchemployee: async (query) => {
    const regex = new RegExp(query, "i");
    return await User.find({
      role: "employee",
      name: regex,
    }).select("-password").lean();
  },

  deleteOne: async (id) => {
    return await User.findByIdAndDelete(id);
  },

  getDetails: async (id) => {
    return await User.findById(id).select("-password").lean();
  },

  updateByEmail: async (email, updateData) => {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    return await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { returnDocument: 'after' },
    );
  },

  updateStatus: async (userId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null
    }
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after' },
    );
  },

  checkAndOfflineUsers: async (timeoutMs = 60000) => {
    const threshold = new Date(Date.now() - timeoutMs);
    return await User.updateMany(
      {
        status: 'online',
        $or: [
          { lastActiveAt: { $lt: threshold } },
          { lastActiveAt: null }
        ]
      },
      {
        $set: { status: 'offline' }
      }
    );
  },
};

// OTP Model (also migrated to Mongoose for consistency)
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true, length: 6 },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "otps",
  },
);

export const OTP = mongoose.model("OTP", otpSchema);
export default User;
