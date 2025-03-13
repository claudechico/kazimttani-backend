const express = require('express');
const router = express.Router();

const reviewsOperation = require('../Model/Reviews');

// GET all reviews for a service
router.get('/service-reviews/:service_id', async (req, res) => {
  try {
    const { service_id } = req.params;
    
    // Validate service_id
    if (!service_id) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    const reviews = await reviewsOperation.getServiceReviews(service_id);
    
    // Add metadata about the reviews
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    
    res.json({
      success: true,
      data: {
        reviews: reviews,
        total: reviews.length,
        averageRating: Number(averageRating.toFixed(1)) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reviews', 
      error: error.message 
    });
  }
});

// GET review by ID
router.get('/single-review/:review_id', async (req, res) => {
  try {
    const review = await reviewsOperation.getReviewById(req.params.review_id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({
      success: true,
      review: review
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
});

// GET service rating
router.get('/service-rating/:service_id', async (req, res) => {
  try {
    const rating = await reviewsOperation.getServiceRating(req.params.service_id);
    res.json({
      success: true,
      rating: rating
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching service rating', 
      error: error.message 
    });
  }
});

router.post('/create-review', async (req, res) => {
  try {
    console.log('Received review data:', req.body);
    const { customer_id, service_id, rating, review_text } = req.body;

    // Enhanced validation
    if (!customer_id || !service_id || !rating || !review_text) {
      return res.status(400).json({ 
        success: false,
        message: 'Customer ID, service ID, rating, and review text are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be between 1 and 5' 
      });
    }

    const reviewData = {
      customer_id,
      service_id,
      rating,
      review_text: review_text.trim()
    };

    const result = await reviewsOperation.createReview(reviewData);
    
    res.status(201).json({ 
      success: true,
      message: 'Review created successfully',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating review', 
      error: error.message 
    });
  }
});

// PUT update review
router.put('/update-review/:review_id', async (req, res) => {
  try {
    const reviewId = req.params.review_id;
    const { customer_id, rating, review_text } = req.body;

    // Basic validation
    if (!customer_id || !rating) {
      return res.status(400).json({ message: 'Customer ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const reviewData = {
      customer_id,
      rating,
      review_text
    };

    await reviewsOperation.updateReview(reviewId, reviewData);
    res.json({ 
      success: true,
      message: 'Review updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// DELETE review
router.delete('/delete-review/:review_id', async (req, res) => {
  try {
    const reviewId = req.params.review_id;
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    await reviewsOperation.deleteReview(reviewId, customer_id);
    res.json({ 
      success: true,
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;