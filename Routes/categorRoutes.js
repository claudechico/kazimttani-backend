const express = require('express');
const router = express.Router();
const categoryOperations = require('../Model/Category');

// GET all categories
router.get('/all-categories', async (req, res) => {
  try {
    const categories = await categoryOperations.getAllCategories();
    res.json({
      success: true,
      category: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// GET category by ID
router.get('/single-category/:category_id', async (req, res) => {
  try {
    const category = await categoryOperations.getServicesByCategoryId(req.params.category_id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// GET services by category ID
router.get('/category-services/:category_id', async (req, res) => {
  try {
    const services = await categoryOperations.getServicesByCategoryId(req.params.category_id);
    
    if (!services || services.length === 0) {
      return res.status(404).json({ message: 'No services found for this category' });
    }
    
    res.json({
      success: true,
      services: services
    });
  } catch (error) {
    console.error('Error fetching services for category:', error);
    res.status(500).json({ message: 'Error fetching services for category', error: error.message });
  }
});

// POST create new category
router.post('/create-category', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryData = {
      name,
      description
    };

    const result = await categoryOperations.createCategory(categoryData);
    
    res.status(201).json({ 
      success: true,
      message: 'Category created successfully',
      categoryId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT update category
router.put('/update-category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await categoryOperations.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryData = {
      name,
      description
    };

    await categoryOperations.updateCategory(categoryId, categoryData);
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE category
router.delete('/delete-category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    // Check if category exists
    const existingCategory = await categoryOperations.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await categoryOperations.deleteCategory(categoryId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router;