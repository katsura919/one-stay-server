const mongoose = require('mongoose');
const Feedback = require('../../models/feedback-model');
const Reservation = require('../../models/reservation-model');
const User = require('../../models/user-model');
const Room = require('../../models/room-model');
const Resort = require('../../models/resort-model');

// Create feedback (customer to owner OR owner to customer)
exports.createFeedback = async (req, res) => {
	try {
		const { reservation_id, rating, comment, feedback_type } = req.body;
		const from_user_id = req.user?.id; // Assuming auth middleware sets req.user

		// Validate required fields
		if (!reservation_id || !rating || !feedback_type) {
			return res.status(400).json({ 
				message: 'Missing required fields: reservation_id, rating, feedback_type' 
			});
		}

		// Validate feedback type
		if (!['customer_to_owner', 'owner_to_customer'].includes(feedback_type)) {
			return res.status(400).json({ 
				message: 'Invalid feedback_type. Must be customer_to_owner or owner_to_customer' 
			});
		}

		// Get reservation with populated data
		const reservation = await Reservation.findById(reservation_id)
			.populate('room_id')
			.populate('user_id');

		if (!reservation) {
			return res.status(404).json({ message: 'Reservation not found.' });
		}

		// Check if reservation is completed
		if (reservation.status !== 'completed') {
			return res.status(400).json({ 
				message: 'Feedback can only be given for completed reservations.' 
			});
		}

		// Get room owner
		const room = await Room.findById(reservation.room_id).populate('resort_id');
		const resort = await Resort.findById(room.resort_id);
		const owner = await User.findById(resort.owner_id);

		let to_user_id;
		
		// Determine who is receiving the feedback
		if (feedback_type === 'customer_to_owner') {
			// Customer giving feedback to owner
			if (from_user_id !== reservation.user_id._id.toString()) {
				return res.status(403).json({ 
					message: 'Only the customer can give feedback to owner for this reservation.' 
				});
			}
			to_user_id = owner._id;
		} else {
			// Owner giving feedback to customer
			if (from_user_id !== owner._id.toString()) {
				return res.status(403).json({ 
					message: 'Only the resort owner can give feedback to customer for this reservation.' 
				});
			}
			to_user_id = reservation.user_id._id;
		}

		// Check if feedback already exists for this reservation and type
		const existingFeedback = await Feedback.findOne({
			reservation_id,
			from_user_id,
			feedback_type,
			deleted: false
		});

		if (existingFeedback) {
			return res.status(400).json({ 
				message: 'Feedback already submitted for this reservation.' 
			});
		}

		// Create feedback
		const feedback = new Feedback({
			from_user_id,
			to_user_id,
			room_id: reservation.room_id,
			reservation_id,
			feedback_type,
			rating,
			comment: comment || ''
		});

		await feedback.save();

		// Populate the created feedback for response
		const populatedFeedback = await Feedback.findById(feedback._id)
			.populate('from_user_id', 'username email')
			.populate('to_user_id', 'username email')
			.populate('room_id', 'room_type')
			.populate('reservation_id');

		res.status(201).json({
			message: 'Feedback created successfully.',
			feedback: populatedFeedback
		});

	} catch (err) {
		console.error('Create feedback error:', err);
		if (err.code === 11000) {
			return res.status(400).json({ 
				message: 'Duplicate feedback. You have already submitted feedback for this reservation.' 
			});
		}
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get feedbacks for a room (public reviews from customers)
exports.getFeedbacksForRoom = async (req, res) => {
	try {
		const { room_id } = req.params;
		const { page = 1, limit = 10 } = req.query;

		const feedbacks = await Feedback.find({ 
			room_id, 
			feedback_type: 'customer_to_owner',
			deleted: false 
		})
		.populate('from_user_id', 'username')
		.populate('reservation_id', 'start_date end_date')
		.sort({ createdAt: -1 })
		.limit(limit * 1)
		.skip((page - 1) * limit);

		const total = await Feedback.countDocuments({ 
			room_id, 
			feedback_type: 'customer_to_owner',
			deleted: false 
		});

		// Calculate average rating
		const ratingStats = await Feedback.aggregate([
			{ 
				$match: { 
					room_id: mongoose.Types.ObjectId(room_id), 
					feedback_type: 'customer_to_owner',
					deleted: false 
				} 
			},
			{ 
				$group: { 
					_id: null, 
					averageRating: { $avg: '$rating' },
					totalReviews: { $sum: 1 }
				} 
			}
		]);

		res.json({
			feedbacks,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalItems: total,
				itemsPerPage: limit
			},
			ratingStats: ratingStats[0] || { averageRating: 0, totalReviews: 0 }
		});

	} catch (err) {
		console.error('Get feedbacks error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get feedback summary for a user (both given and received)
exports.getUserFeedbackSummary = async (req, res) => {
	try {
		const { user_id } = req.params;

		// Feedback given by user
		const feedbackGiven = await Feedback.find({ 
			from_user_id: user_id,
			deleted: false 
		})
		.populate('to_user_id', 'username')
		.populate('room_id', 'room_type')
		.populate('reservation_id', 'start_date end_date')
		.sort({ createdAt: -1 });

		// Feedback received by user
		const feedbackReceived = await Feedback.find({ 
			to_user_id: user_id,
			deleted: false 
		})
		.populate('from_user_id', 'username')
		.populate('room_id', 'room_type')
		.populate('reservation_id', 'start_date end_date')
		.sort({ createdAt: -1 });

		// Calculate average ratings
		const receivedRatingStats = await Feedback.aggregate([
			{ 
				$match: { 
					to_user_id: mongoose.Types.ObjectId(user_id),
					deleted: false 
				} 
			},
			{ 
				$group: { 
					_id: '$feedback_type',
					averageRating: { $avg: '$rating' },
					totalReviews: { $sum: 1 }
				} 
			}
		]);

		res.json({
			feedbackGiven: {
				count: feedbackGiven.length,
				items: feedbackGiven
			},
			feedbackReceived: {
				count: feedbackReceived.length,
				items: feedbackReceived,
				ratingStats: receivedRatingStats
			}
		});

	} catch (err) {
		console.error('Get user feedback summary error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get feedback eligibility for a reservation
exports.getFeedbackEligibility = async (req, res) => {
	try {
		const { reservation_id } = req.params;
		const user_id = req.user?.id;

		const reservation = await Reservation.findById(reservation_id)
			.populate('room_id')
			.populate('user_id');

		if (!reservation) {
			return res.status(404).json({ message: 'Reservation not found.' });
		}

		// Get resort owner
		const room = await Room.findById(reservation.room_id).populate('resort_id');
		const resort = await Resort.findById(room.resort_id);
		
		// Check existing feedback
		const customerFeedback = await Feedback.findOne({
			reservation_id,
			feedback_type: 'customer_to_owner',
			deleted: false
		});

		const ownerFeedback = await Feedback.findOne({
			reservation_id,
			feedback_type: 'owner_to_customer',
			deleted: false
		});

		// Determine user type and eligibility
		let canGiveFeedback = false;
		let feedbackType = null;
		let alreadySubmitted = false;

		console.log('Feedback Eligibility Debug:');
		console.log('- User ID:', user_id);
		console.log('- Customer ID:', reservation.user_id._id.toString());
		console.log('- Owner ID:', resort.owner_id.toString());
		console.log('- Existing customer feedback:', !!customerFeedback);
		console.log('- Existing owner feedback:', !!ownerFeedback);
		console.log('- Reservation status:', reservation.status);

		if (user_id === reservation.user_id._id.toString()) {
			// User is the customer
			feedbackType = 'customer_to_owner';
			alreadySubmitted = !!customerFeedback;
			canGiveFeedback = reservation.status === 'completed' && !alreadySubmitted;
		} else if (user_id === resort.owner_id.toString()) {
			// User is the owner
			feedbackType = 'owner_to_customer';
			alreadySubmitted = !!ownerFeedback;
			canGiveFeedback = reservation.status === 'completed' && !alreadySubmitted;
		}

		res.json({
			canGiveFeedback,
			feedbackType,
			alreadySubmitted,
			reservationStatus: reservation.status,
			mutualFeedback: {
				customerFeedbackGiven: !!customerFeedback,
				ownerFeedbackGiven: !!ownerFeedback,
				bothCompleted: !!customerFeedback && !!ownerFeedback
			}
		});

	} catch (err) {
		console.error('Get feedback eligibility error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update feedback (only by the original author)
exports.updateFeedback = async (req, res) => {
	try {
		const { id } = req.params;
		const { rating, comment } = req.body;
		const user_id = req.user?.id;

		const feedback = await Feedback.findOne({ 
			_id: id, 
			from_user_id: user_id,
			deleted: false 
		});

		if (!feedback) {
			return res.status(404).json({ 
				message: 'Feedback not found or you do not have permission to update it.' 
			});
		}

		// Update fields
		if (rating) feedback.rating = rating;
		if (comment !== undefined) feedback.comment = comment;
		feedback.updatedAt = Date.now();

		await feedback.save();

		const updatedFeedback = await Feedback.findById(feedback._id)
			.populate('from_user_id', 'username email')
			.populate('to_user_id', 'username email')
			.populate('room_id', 'room_type')
			.populate('reservation_id');

		res.json({
			message: 'Feedback updated successfully.',
			feedback: updatedFeedback
		});

	} catch (err) {
		console.error('Update feedback error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete feedback (only by the original author or admin)
exports.deleteFeedback = async (req, res) => {
	try {
		const { id } = req.params;
		const user_id = req.user?.id;

		const feedback = await Feedback.findOneAndUpdate(
			{ 
				_id: id, 
				from_user_id: user_id,
				deleted: false 
			},
			{ deleted: true, updatedAt: Date.now() },
			{ new: true }
		);

		if (!feedback) {
			return res.status(404).json({ 
				message: 'Feedback not found or you do not have permission to delete it.' 
			});
		}

		res.json({ message: 'Feedback deleted successfully.' });

	} catch (err) {
		console.error('Delete feedback error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};
