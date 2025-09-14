const Reservation = require('../../models/reservation-model');
const Room = require('../../models/room-model');
const User = require('../../models/user-model');
const { isRoomAvailable, getBookedDates, calculateTotalPrice } = require('../../utils/dateAvailability');

/**
 * Check room availability for specific dates
 * GET /api/reservations/availability/:roomId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
const checkAvailability = async (req, res) => {
	try {
		const { roomId } = req.params;
		const { start_date, end_date } = req.query;

		if (!start_date || !end_date) {
			return res.status(400).json({
				error: 'Start date and end date are required'
			});
		}

		const startDate = new Date(start_date);
		const endDate = new Date(end_date);

		// Check if room exists
		const room = await Room.findById(roomId).populate('resort_id');
		if (!room || room.deleted) {
			return res.status(404).json({
				error: 'Room not found'
			});
		}

		// Check availability
		const available = await isRoomAvailable(roomId, startDate, endDate);
		
		// Calculate pricing
		const totalPrice = calculateTotalPrice(room.price_per_night, startDate, endDate);

		res.json({
			available,
			room: {
				id: room._id,
				type: room.room_type,
				capacity: room.capacity,
				price_per_night: room.price_per_night,
				resort: room.resort_id
			},
			booking_details: {
				start_date: startDate,
				end_date: endDate,
				total_price: totalPrice,
				nights: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
			}
		});
	} catch (error) {
		console.error('Error checking availability:', error);
		res.status(500).json({
			error: 'Failed to check availability'
		});
	}
};

/**
 * Get booked dates for a room
 * GET /api/reservations/booked-dates/:roomId
 */
const getBookedDatesForRoom = async (req, res) => {
	try {
		const { roomId } = req.params;

		// Check if room exists
		const room = await Room.findById(roomId);
		if (!room || room.deleted) {
			return res.status(404).json({
				error: 'Room not found'
			});
		}

		const bookedDates = await getBookedDates(roomId);

		res.json({
			room_id: roomId,
			booked_dates: bookedDates
		});
	} catch (error) {
		console.error('Error getting booked dates:', error);
		res.status(500).json({
			error: 'Failed to get booked dates'
		});
	}
};

/**
 * Create a new reservation
 * POST /api/reservations
 */
const createReservation = async (req, res) => {
	try {
		const { room_id, start_date, end_date } = req.body;
		const user_id = req.user.id; // From auth middleware

		// Get room details
		const room = await Room.findById(room_id);
		if (!room || room.deleted) {
			return res.status(404).json({
				error: 'Room not found'
			});
		}

		const startDate = req.validatedDates.start_date;
		const endDate = req.validatedDates.end_date;

		// Check availability
		const available = await isRoomAvailable(room_id, startDate, endDate);
		if (!available) {
			return res.status(409).json({
				error: 'Room is not available for the selected dates'
			});
		}

		// Calculate total price
		const totalPrice = calculateTotalPrice(room.price_per_night, startDate, endDate);

		// Create reservation
		const reservation = new Reservation({
			user_id,
			room_id,
			start_date: startDate,
			end_date: endDate,
			total_price: totalPrice,
			status: 'pending'
		});

		await reservation.save();

		// Populate the reservation with related data
		const populatedReservation = await Reservation.findById(reservation._id)
			.populate('user_id', 'username email')
			.populate({
				path: 'room_id',
				populate: {
					path: 'resort_id',
					select: 'resort_name location'
				}
			});

		res.status(201).json({
			message: 'Reservation created successfully',
			reservation: populatedReservation
		});
	} catch (error) {
		console.error('Error creating reservation:', error);
		res.status(500).json({
			error: 'Failed to create reservation'
		});
	}
};

/**
 * Get user's reservations
 * GET /api/reservations/my-reservations
 */
const getUserReservations = async (req, res) => {
	try {
		const user_id = req.user.id;
		const { status } = req.query;

		// Build query
		const query = { user_id, deleted: false };
		if (status) {
			query.status = status;
		}

		const reservations = await Reservation.find(query)
			.populate({
				path: 'room_id',
				populate: {
					path: 'resort_id',
					select: 'resort_name location image'
				}
			})
			.sort({ createdAt: -1 });

		res.json({
			reservations
		});
	} catch (error) {
		console.error('Error getting user reservations:', error);
		res.status(500).json({
			error: 'Failed to get reservations'
		});
	}
};

/**
 * Get owner's reservations (for their resorts)
 * GET /api/reservations/owner-reservations
 */
const getOwnerReservations = async (req, res) => {
	try {
		const owner_id = req.user.id;
		const { status } = req.query;

		// First, get all rooms belonging to owner's resorts
		const rooms = await Room.find({ deleted: false })
			.populate({
				path: 'resort_id',
				match: { owner_id, deleted: false }
			});

		const ownerRoomIds = rooms
			.filter(room => room.resort_id)
			.map(room => room._id);

		// Build query for reservations
		const query = { room_id: { $in: ownerRoomIds }, deleted: false };
		if (status) {
			query.status = status;
		}

		const reservations = await Reservation.find(query)
			.populate('user_id', 'username email')
			.populate({
				path: 'room_id',
				populate: {
					path: 'resort_id',
					select: 'resort_name location'
				}
			})
			.sort({ createdAt: -1 });

		res.json({
			reservations
		});
	} catch (error) {
		console.error('Error getting owner reservations:', error);
		res.status(500).json({
			error: 'Failed to get reservations'
		});
	}
};

/**
 * Update reservation status (approve/reject)
 * PUT /api/reservations/:reservationId/status
 */
const updateReservationStatus = async (req, res) => {
	try {
		const { reservationId } = req.params;
		const { status } = req.body;
		const user_id = req.user.id;

		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({
				error: 'Status must be either approved or rejected'
			});
		}

		// Get reservation with room and resort details
		const reservation = await Reservation.findById(reservationId)
			.populate({
				path: 'room_id',
				populate: {
					path: 'resort_id'
				}
			});

		if (!reservation || reservation.deleted) {
			return res.status(404).json({
				error: 'Reservation not found'
			});
		}

		// Check if user is the owner of the resort
		if (reservation.room_id.resort_id.owner_id.toString() !== user_id) {
			return res.status(403).json({
				error: 'Not authorized to update this reservation'
			});
		}

		// If approving, check availability again
		if (status === 'approved') {
			const available = await isRoomAvailable(
				reservation.room_id._id,
				reservation.start_date,
				reservation.end_date,
				reservationId
			);

			if (!available) {
				return res.status(409).json({
					error: 'Room is no longer available for these dates'
				});
			}
		}

		// Update status
		reservation.status = status;
		await reservation.save();

		res.json({
			message: `Reservation ${status} successfully`,
			reservation
		});
	} catch (error) {
		console.error('Error updating reservation status:', error);
		res.status(500).json({
			error: 'Failed to update reservation status'
		});
	}
};

/**
 * Cancel reservation (customer only)
 * DELETE /api/reservations/:reservationId
 */
const cancelReservation = async (req, res) => {
	try {
		const { reservationId } = req.params;
		const user_id = req.user.id;

		const reservation = await Reservation.findById(reservationId);
		if (!reservation || reservation.deleted) {
			return res.status(404).json({
				error: 'Reservation not found'
			});
		}

		// Check if user owns this reservation
		if (reservation.user_id.toString() !== user_id) {
			return res.status(403).json({
				error: 'Not authorized to cancel this reservation'
			});
		}

		// Only allow cancellation of pending reservations
		if (reservation.status !== 'pending') {
			return res.status(400).json({
				error: 'Only pending reservations can be cancelled'
			});
		}

		// Soft delete
		reservation.deleted = true;
		await reservation.save();

		res.json({
			message: 'Reservation cancelled successfully'
		});
	} catch (error) {
		console.error('Error cancelling reservation:', error);
		res.status(500).json({
			error: 'Failed to cancel reservation'
		});
	}
};

/**
 * Get all reservations (for admin purposes)
 * GET /api/reservations
 */
const getAllReservations = async (req, res) => {
	try {
		const { status } = req.query;
		
		// Build query
		const query = { deleted: false };
		if (status) {
			query.status = status;
		}

		const reservations = await Reservation.find(query)
			.populate('user_id', 'username email')
			.populate({
				path: 'room_id',
				populate: {
					path: 'resort_id',
					select: 'resort_name location'
				}
			})
			.sort({ createdAt: -1 });

		res.json({
			reservations
		});
	} catch (error) {
		console.error('Error getting all reservations:', error);
		res.status(500).json({
			error: 'Failed to get reservations'
		});
	}
};

/**
 * Get reservation by ID
 * GET /api/reservations/:reservationId
 */
const getReservationById = async (req, res) => {
	try {
		const { reservationId } = req.params;

		const reservation = await Reservation.findOne({ _id: reservationId, deleted: false })
			.populate('user_id', 'username email')
			.populate({
				path: 'room_id',
				populate: {
					path: 'resort_id',
					select: 'resort_name location image'
				}
			});

		if (!reservation) {
			return res.status(404).json({
				error: 'Reservation not found'
			});
		}

		res.json({
			reservation
		});
	} catch (error) {
		console.error('Error getting reservation by ID:', error);
		res.status(500).json({
			error: 'Failed to get reservation'
		});
	}
};

module.exports = {
	checkAvailability,
	getBookedDatesForRoom,
	createReservation,
	getUserReservations,
	getOwnerReservations,
	updateReservationStatus,
	cancelReservation,
	getAllReservations,
	getReservationById
};
