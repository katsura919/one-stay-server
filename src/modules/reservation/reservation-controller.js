const Reservation = require('../../models/reservation-model');

// Create a reservation
exports.createReservation = async (req, res) => {
	try {
		const { user_id, room_id, start_date, end_date } = req.body;
		const reservation = new Reservation({ user_id, room_id, start_date, end_date });
		await reservation.save();
		res.status(201).json(reservation);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get all reservations (excluding soft deleted)
exports.getAllReservations = async (req, res) => {
	try {
		const reservations = await Reservation.find({ deleted: false });
		res.json(reservations);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
	try {
		const reservation = await Reservation.findOne({ _id: req.params.id, deleted: false });
		if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
		res.json(reservation);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update reservation status
exports.updateReservationStatus = async (req, res) => {
	try {
		const { status } = req.body;
		const reservation = await Reservation.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ status },
			{ new: true }
		);
		if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
		res.json(reservation);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete reservation
exports.deleteReservation = async (req, res) => {
	try {
		const reservation = await Reservation.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ deleted: true },
			{ new: true }
		);
		if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
		res.json({ message: 'Reservation soft deleted.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
