const express = require('express');
const router = express.Router();
const feedbackController = require('./feedback-controller');
const { authMiddleware } = require('../../middleware/auth');

// Create feedback (requires authentication)
router.post('/', authMiddleware, feedbackController.createFeedback);

// Update feedback (requires authentication)
router.put('/:id', authMiddleware, feedbackController.updateFeedback);

// Delete feedback (requires authentication)
router.delete('/:id', authMiddleware, feedbackController.deleteFeedback);

// Get feedbacks for a room (public - customer reviews)
router.get('/room/:room_id', feedbackController.getFeedbacksForRoom);

// Get user's feedback summary (both given and received)
router.get('/user/:user_id', feedbackController.getUserFeedbackSummary);

// Check feedback eligibility for a reservation
router.get('/eligibility/:reservation_id', authMiddleware, feedbackController.getFeedbackEligibility);

module.exports = router;
