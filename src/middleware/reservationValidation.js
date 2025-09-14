/**
 * Middleware to validate reservation date ranges
 */
const validateReservationDates = (req, res, next) => {
	const { start_date, end_date } = req.body;

	// Check if dates are provided
	if (!start_date || !end_date) {
		return res.status(400).json({
			error: 'Start date and end date are required'
		});
	}

	const startDate = new Date(start_date);
	const endDate = new Date(end_date);
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Reset time to start of day

	// Check if dates are valid
	if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
		return res.status(400).json({
			error: 'Invalid date format'
		});
	}

	// Check if start date is not in the past
	if (startDate < today) {
		return res.status(400).json({
			error: 'Start date cannot be in the past'
		});
	}

	// Check if start date is before end date
	if (startDate >= endDate) {
		return res.status(400).json({
			error: 'End date must be after start date'
		});
	}

	// Check minimum stay (at least 1 night)
	const diffTime = endDate - startDate;
	const diffDays = diffTime / (1000 * 60 * 60 * 24);
	
	if (diffDays < 1) {
		return res.status(400).json({
			error: 'Minimum stay is 1 night'
		});
	}

	// Check maximum stay (optional - let's say 30 days max)
	if (diffDays > 30) {
		return res.status(400).json({
			error: 'Maximum stay is 30 nights'
		});
	}

	// Add validated dates to request object
	req.validatedDates = {
		start_date: startDate,
		end_date: endDate,
		nights: diffDays
	};

	next();
};

/**
 * Middleware to validate room ID format
 */
const validateRoomId = (req, res, next) => {
	const { room_id } = req.body;
	const roomIdParam = req.params.roomId;
	
	const roomId = room_id || roomIdParam;

	if (!roomId) {
		return res.status(400).json({
			error: 'Room ID is required'
		});
	}

	// Check if it's a valid MongoDB ObjectId format
	if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
		return res.status(400).json({
			error: 'Invalid room ID format'
		});
	}

	next();
};

/**
 * Middleware to validate reservation ID format
 */
const validateReservationId = (req, res, next) => {
	const { reservationId } = req.params;

	if (!reservationId) {
		return res.status(400).json({
			error: 'Reservation ID is required'
		});
	}

	// Check if it's a valid MongoDB ObjectId format
	if (!/^[0-9a-fA-F]{24}$/.test(reservationId)) {
		return res.status(400).json({
			error: 'Invalid reservation ID format'
		});
	}

	next();
};

module.exports = {
	validateReservationDates,
	validateRoomId,
	validateReservationId
};