const Category = require('../models/Category');

const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  return res.json({ categories });
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json({ category });
  } catch (error) {
    return res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  return res.json({ category });
};

const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  return res.json({ message: 'Category deleted' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
