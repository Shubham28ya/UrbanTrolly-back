// src/controllers/category.controller.js
import Category from '../models/Category.js';

const buildCategoryTree = async (parent = null) => {
  const categories = await Category.find({ parent });

  const result = [];
  for (const category of categories) {
    const children = await buildCategoryTree(category._id);
    result.push({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      categoryId: category.categoryId,
      children,
    });
  }
  return result;
};

export const getAllCategories = async (req, res) => {
  try {
    const tree = await buildCategoryTree();
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
