import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 50, trim: true },
  slug: { type: String, required: true, minLength: 2, trim: true, unique: true }
}, {
  timestamps: true,
  collection: 'category'
})

const Category = mongoose.model('Category', categorySchema)

export const categoryModel = {
  CATEGORY_COLLECTION_NAME: 'category',
  
  createNew: async (data) => {
    return await Category.create(data)
  },

  findOneId: async (id) => {
    return await Category.findById(id)
  },

  getDetails: async (id) => {
    return await Category.findById(id)
  },

  getAll: async () => {
    return await Category.find()
  },

  deleteOne: async (id) => {
    return await Category.findByIdAndDelete(id)
  },

  search: async (query) => {
    const regex = new RegExp(query, 'i')
    return await Category.find({ name: regex })
  },

  updateOne: async (id, data) => {
    return await Category.findByIdAndUpdate(id, { $set: data }, { new: true })
  }
}

export default Category