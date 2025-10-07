const Feedback = require('../../models/feedback-model');
const Room = require('../../models/room-model');
const Reservation = require('../../models/reservation-model');
const mongoose = require('mongoose');

/**
 * Get comprehensive statistics for a resort
 * Includes: average rating, total rooms, total reservations, total feedbacks
 */
const getResortStats = async (req, res) => {
	try {
		const { resortId } = req.params;

		// Validate resortId
		if (!mongoose.Types.ObjectId.isValid(resortId)) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid resort ID' 
			});
		}

		// Get all rooms for this resort
		const rooms = await Room.find({ 
			resort_id: resortId, 
			deleted: false 
		});

		if (rooms.length === 0) {
			return res.status(404).json({ 
				success: false, 
				message: 'Resort not found or has no rooms' 
			});
		}

		const roomIds = rooms.map(room => room._id);

		// Get total reservations for all rooms in this resort
		const totalReservations = await Reservation.countDocuments({
			room_id: { $in: roomIds },
			deleted: false
		});

		// Get all feedbacks for rooms in this resort (customer_to_owner only for resort rating)
		const feedbacks = await Feedback.find({
			room_id: { $in: roomIds },
			feedback_type: 'customer_to_owner',
			deleted: false
		});

		// Calculate average rating
		let averageRating = 0;
		if (feedbacks.length > 0) {
			const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
			averageRating = (totalRating / feedbacks.length).toFixed(2);
		}

		// Get total feedbacks count (both types)
		const totalFeedbacks = await Feedback.countDocuments({
			room_id: { $in: roomIds },
			deleted: false
		});

		return res.status(200).json({
			success: true,
			stats: {
				resortId,
				averageRating: parseFloat(averageRating),
				totalRooms: rooms.length,
				totalReservations,
				totalFeedbacks,
				ratingBreakdown: {
					5: feedbacks.filter(f => f.rating === 5).length,
					4: feedbacks.filter(f => f.rating === 4).length,
					3: feedbacks.filter(f => f.rating === 3).length,
					2: feedbacks.filter(f => f.rating === 2).length,
					1: feedbacks.filter(f => f.rating === 1).length,
				}
			}
		});

	} catch (error) {
		console.error('Error fetching resort stats:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Server error while fetching resort statistics',
			error: error.message 
		});
	}
};

/**
 * Get average rating for a resort
 */
const getResortAverageRating = async (req, res) => {
	try {
		const { resortId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(resortId)) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid resort ID' 
			});
		}

		const rooms = await Room.find({ 
			resort_id: resortId, 
			deleted: false 
		});

		if (rooms.length === 0) {
			return res.status(404).json({ 
				success: false, 
				message: 'Resort not found or has no rooms' 
			});
		}

		const roomIds = rooms.map(room => room._id);

		const feedbacks = await Feedback.find({
			room_id: { $in: roomIds },
			feedback_type: 'customer_to_owner',
			deleted: false
		});

		let averageRating = 0;
		if (feedbacks.length > 0) {
			const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
			averageRating = (totalRating / feedbacks.length).toFixed(2);
		}

		return res.status(200).json({
			success: true,
			resortId,
			averageRating: parseFloat(averageRating),
			totalRatings: feedbacks.length
		});

	} catch (error) {
		console.error('Error fetching resort average rating:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Server error while fetching resort rating',
			error: error.message 
		});
	}
};

/**
 * Get total rooms for a resort
 */
const getResortTotalRooms = async (req, res) => {
	try {
		const { resortId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(resortId)) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid resort ID' 
			});
		}

		const totalRooms = await Room.countDocuments({ 
			resort_id: resortId, 
			deleted: false 
		});

		// Get breakdown by status
		const roomsByStatus = await Room.aggregate([
			{ 
				$match: { 
					resort_id: new mongoose.Types.ObjectId(resortId), 
					deleted: false 
				} 
			},
			{ 
				$group: { 
					_id: '$status', 
					count: { $sum: 1 } 
				} 
			}
		]);

		const statusBreakdown = {};
		roomsByStatus.forEach(item => {
			statusBreakdown[item._id] = item.count;
		});

		return res.status(200).json({
			success: true,
			resortId,
			totalRooms,
			breakdown: statusBreakdown
		});

	} catch (error) {
		console.error('Error fetching resort total rooms:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Server error while fetching total rooms',
			error: error.message 
		});
	}
};

/**
 * Get total reservations for a resort
 */
const getResortTotalReservations = async (req, res) => {
	try {
		const { resortId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(resortId)) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid resort ID' 
			});
		}

		const rooms = await Room.find({ 
			resort_id: resortId, 
			deleted: false 
		});

		if (rooms.length === 0) {
			return res.status(404).json({ 
				success: false, 
				message: 'Resort not found or has no rooms' 
			});
		}

		const roomIds = rooms.map(room => room._id);

		const totalReservations = await Reservation.countDocuments({
			room_id: { $in: roomIds },
			deleted: false
		});

		// Get breakdown by status
		const reservationsByStatus = await Reservation.aggregate([
			{ 
				$match: { 
					room_id: { $in: roomIds }, 
					deleted: false 
				} 
			},
			{ 
				$group: { 
					_id: '$status', 
					count: { $sum: 1 } 
				} 
			}
		]);

		const statusBreakdown = {};
		reservationsByStatus.forEach(item => {
			statusBreakdown[item._id] = item.count;
		});

		return res.status(200).json({
			success: true,
			resortId,
			totalReservations,
			breakdown: statusBreakdown
		});

	} catch (error) {
		console.error('Error fetching resort total reservations:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Server error while fetching total reservations',
			error: error.message 
		});
	}
};

/**
 * Get total feedbacks for a resort
 */
const getResortTotalFeedbacks = async (req, res) => {
	try {
		const { resortId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(resortId)) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid resort ID' 
			});
		}

		const rooms = await Room.find({ 
			resort_id: resortId, 
			deleted: false 
		});

		if (rooms.length === 0) {
			return res.status(404).json({ 
				success: false, 
				message: 'Resort not found or has no rooms' 
			});
		}

		const roomIds = rooms.map(room => room._id);

		const totalFeedbacks = await Feedback.countDocuments({
			room_id: { $in: roomIds },
			deleted: false
		});

		// Get breakdown by feedback type
		const feedbacksByType = await Feedback.aggregate([
			{ 
				$match: { 
					room_id: { $in: roomIds }, 
					deleted: false 
				} 
			},
			{ 
				$group: { 
					_id: '$feedback_type', 
					count: { $sum: 1 } 
				} 
			}
		]);

		const typeBreakdown = {};
		feedbacksByType.forEach(item => {
			typeBreakdown[item._id] = item.count;
		});

		return res.status(200).json({
			success: true,
			resortId,
			totalFeedbacks,
			breakdown: typeBreakdown
		});

	} catch (error) {
		console.error('Error fetching resort total feedbacks:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Server error while fetching total feedbacks',
			error: error.message 
		});
	}
};

module.exports = {
	getResortStats,
	getResortAverageRating,
	getResortTotalRooms,
	getResortTotalReservations,
	getResortTotalFeedbacks
};
