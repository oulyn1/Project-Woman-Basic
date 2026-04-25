import User from "./userModel";

const findAll = async () => {
  const users = await User.find({ role: "customer" }).select("-password");
  return users.map((u) => ({
    _id: u._id,
    fullName: u.name,
    email: u.email,
    phone: u.phone
  }));
};

const search = async (q) => {
  const regex = new RegExp(q, "i");
  const users = await User.find({
    role: "customer",
    $or: [{ name: regex }, { email: regex }, { phone: regex }],
  }).select("_id name email phone");

  // Map 'name' to 'fullName' as requested by user
  return users.map((u) => ({
    _id: u._id,
    fullName: u.name,
    email: u.email,
  }));
};

const findById = async (id) => {
  return User.findOne({ _id: id, role: "customer" }).select("-password");
};

export const customerModel = { findAll, search, findById };
