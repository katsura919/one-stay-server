const Reservation = require('../models/reservation-model');

/**
 * Check if a room is available for the given date range
 * @param {string} roomId - The room ID to check
 * @param {Date} startDate - Check-in date
 * @param {Date} endDate - Check-out date
 * @param {string} excludeReservationId - Reservation ID to exclude (for updates)
 * @returns {Promise<boolean>} - True if available, false if not
 */
const isRoomAvailable = async (roomId, startDate, endDate, excludeReservationId = null) => {
	try {
		// Build query to find conflicting reservations
		const query = {
			room_id: roomId,
			deleted: false,
			status: { $in: ['pending', 'approved'] }, // Only consider pending/approved reservations
			$or: [
				// New reservation starts during existing reservation
				{
					start_date: { $lte: startDate },
					end_date: { $gt: startDate }
				},
				// New reservation ends during existing reservation
				{
					start_date: { $lt: endDate },
					end_date: { $gte: endDate }
				},
				// New reservation completely contains existing reservation
				{
					start_date: { $gte: startDate },
					end_date: { $lte: endDate }
				},
				// Existing reservation completely contains new reservation
				{
					start_date: { $lte: startDate },
					end_date: { $gte: endDate }
				}
			]
		};

		// Exclude specific reservation if provided (for updates)
		if (excludeReservationId) {
			query._id = { $ne: excludeReservationId };
		}

		const conflictingReservations = await Reservation.find(query);
		
		return conflictingReservations.length === 0;
	} catch (error) {
		console.error('Error checking room availability:', error);
		throw error;
	}
};

/**
 * Get all booked dates for a room
 * @param {string} roomId - The room ID
 * @returns {Promise<Array>} - Array of booked date ranges
 */
const getBookedDates = async (roomId) => {
	try {
		const reservations = await Reservation.find({
			room_id: roomId,
			deleted: false,
			status: { $in: ['pending', 'approved'] }
		}).select('start_date end_date status');

		return reservations.map(reservation => ({
			start_date: reservation.start_date,
			end_date: reservation.end_date,
			status: reservation.status
		}));
	} catch (error) {
		console.error('Error getting booked dates:', error);
		throw error;
	}
};

/**
 * Calculate the number of nights between two dates
 * @param {Date} startDate - Check-in date
 * @param {Date} endDate - Check-out date
 * @returns {number} - Number of nights
 */
const calculateNights = (startDate, endDate) => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end - start);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
};

/**
 * Calculate total price for a reservation
 * @param {number} pricePerNight - Room price per night
 * @param {Date} startDate - Check-in date
 * @param {Date} endDate - Check-out date
 * @returns {number} - Total price
 */
const calculateTotalPrice = (pricePerNight, startDate, endDate) => {
	const nights = calculateNights(startDate, endDate);
	return pricePerNight * nights;
};

module.exports = {
	isRoomAvailable,
	getBookedDates,
	calculateNights,
	calculateTotalPrice
};