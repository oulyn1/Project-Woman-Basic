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
    return await User.findById(id);
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
      { new: true },
    );
  },

  getAll: async () => {
    return await User.find();
  },

  search: async (query) => {
    const regex = new RegExp(query, "i");
    return await User.find({ name: regex });
  },

  employee: async (query) => {
    const regex = new RegExp(query, "i");
    return await User.find({ role: regex });
  },

  searchemployee: async (query) => {
    const regex = new RegExp(query, "i");
    return await User.find({
      role: "employee",
      name: regex,
    });
  },

  deleteOne: async (id) => {
    return await User.findByIdAndDelete(id);
  },

  getDetails: async (id) => {
    return await User.findById(id);
  },

  updateByEmail: async (email, updateData) => {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    return await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true },
    );
  },

  updateStatus: async (userId, updateData) => {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
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
