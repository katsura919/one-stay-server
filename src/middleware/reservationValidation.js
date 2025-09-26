/**
 * Middleware to validate reservation date ranges
 */
const validateReservationDates = (req, res, next) => {
	console.log('=== validateReservationDates DEBUG START ===');
	console.log('req.body:', req.body);
	console.log('req.headers Content-Type:', req.headers['content-type']);
	
	// Safety check for req.body
	if (!req.body || Object.keys(req.body).length === 0) {
		console.error('req.body is undefined or empty in validateReservationDates');
		console.log('Raw request headers:', req.headers);
		return res.status(400).json({
			error: 'Request body is missing or empty. Make sure Content-Type is application/json',
			code: 'MISSING_BODY'
		});
	}

	const { start_date, end_date } = req.body;
	console.log('Extracted dates:', { start_date, end_date });

	// Check if dates are provided
	if (!start_date || !end_date) {
		console.log('Missing dates - start_date:', start_date, 'end_date:', end_date);
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

	// Maximum stay limit removed to allow extended stays of any duration

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
	console.log('=== validateRoomId DEBUG START ===');
	console.log('req.method:', req.method);
	console.log('req.body:', req.body);
	console.log('req.params:', req.params);
	
	// For GET routes, room ID is in params. For POST routes, it's in body
	const { room_id } = req.body || {}; // Safe destructuring
	const roomIdParam = req.params.roomId;
	
	const roomId = room_id || roomIdParam;
	console.log('Room ID from body:', room_id);
	console.log('Room ID from params:', roomIdParam);
	console.log('Final room ID:', roomId);

	if (!roomId) {
		console.log('No room ID found in body or params');
		return res.status(400).json({
			error: 'Room ID is required'
		});
	}

	// Check if it's a valid MongoDB ObjectId format
	if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
		console.log('Invalid room ID format:', roomId);
		return res.status(400).json({
			error: 'Invalid room ID format'
		});
	}

	console.log('Room ID validation passed');
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