const Feedback = require('../../models/feedback-model');

// Create feedback
exports.createFeedback = async (req, res) => {
	try {
		const { user_id, room_id, reservation_id, rating, comment } = req.body;
		const feedback = new Feedback({ user_id, room_id, reservation_id, rating, comment });
		await feedback.save();
		res.status(201).json(feedback);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get all feedbacks for a room (excluding soft deleted)
exports.getFeedbacksForRoom = async (req, res) => {
	try {
		const feedbacks = await Feedback.find({ room_id: req.params.room_id, deleted: false });
		res.json(feedbacks);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete feedback
exports.deleteFeedback = async (req, res) => {
	try {
		const feedback = await Feedback.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ deleted: true },
			{ new: true }
		);
		if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
		res.json({ message: 'Feedback soft deleted.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
