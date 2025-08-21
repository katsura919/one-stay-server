const express = require('express');
const router = express.Router();
const feedbackController = require('./feedback-controller');

router.post('/', feedbackController.createFeedback);
router.get('/room/:room_id', feedbackController.getFeedbacksForRoom);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
