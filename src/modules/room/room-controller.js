const Room = require('../../models/room-model');

// Create a room
exports.createRoom = async (req, res) => {
	try {
		const { resort_id, room_type, capacity, status } = req.body;
		const room = new Room({ resort_id, room_type, capacity, status });
		await room.save();
		res.status(201).json(room);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get all rooms (excluding soft deleted)
exports.getAllRooms = async (req, res) => {
	try {
		const rooms = await Room.find({ deleted: false });
		res.json(rooms);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get room by ID
exports.getRoomById = async (req, res) => {
	try {
		const room = await Room.findOne({ _id: req.params.id, deleted: false });
		if (!room) return res.status(404).json({ message: 'Room not found.' });
		res.json(room);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update room
exports.updateRoom = async (req, res) => {
	try {
		const { room_type, capacity, status } = req.body;
		const room = await Room.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ room_type, capacity, status },
			{ new: true }
		);
		if (!room) return res.status(404).json({ message: 'Room not found.' });
		res.json(room);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete room
exports.deleteRoom = async (req, res) => {
	try {
		const room = await Room.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ deleted: true },
			{ new: true }
		);
		if (!room) return res.status(404).json({ message: 'Room not found.' });
		res.json({ message: 'Room soft deleted.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
