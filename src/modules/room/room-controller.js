const Room = require('../../models/room-model');
const Resort = require('../../models/resort-model');
const { getBookedDates } = require('../../utils/dateAvailability');

// Create a room
exports.createRoom = async (req, res) => {
	try {
		const { resort_id, room_type, capacity, price_per_night, status } = req.body;
		
		// Validate that resort exists and user owns it (if auth middleware provides user)
		if (req.user) {
			const resort = await Resort.findOne({ _id: resort_id, owner_id: req.user.id, deleted: false });
			if (!resort) {
				return res.status(403).json({ message: 'Not authorized to add rooms to this resort.' });
			}
		}

		const room = new Room({ resort_id, room_type, capacity, price_per_night, status });
		await room.save();
		
		// Populate resort details in response
		const populatedRoom = await Room.findById(room._id).populate('resort_id', 'resort_name location');
		
		res.status(201).json(populatedRoom);
	} catch (err) {
		console.error('Error creating room:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get all rooms (excluding soft deleted)
exports.getAllRooms = async (req, res) => {
	try {
		const { resort_id } = req.query;
		
		// Build query
		const query = { deleted: false };
		if (resort_id) {
			query.resort_id = resort_id;
		}

		const rooms = await Room.find(query)
			.populate('resort_id', 'resort_name location image');
		
		res.json(rooms);
	} catch (err) {
		console.error('Error getting rooms:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get rooms by resort ID
exports.getRoomsByResort = async (req, res) => {
	try {
		const { resortId } = req.params;
		
		// Check if resort exists
		const resort = await Resort.findOne({ _id: resortId, deleted: false });
		if (!resort) {
			return res.status(404).json({ message: 'Resort not found.' });
		}

		const rooms = await Room.find({ resort_id: resortId, deleted: false })
			.populate('resort_id', 'resort_name location image');
		
		res.json({
			resort,
			rooms
		});
	} catch (err) {
		console.error('Error getting rooms by resort:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get room by ID with availability info
exports.getRoomById = async (req, res) => {
	try {
		const room = await Room.findOne({ _id: req.params.id, deleted: false })
			.populate('resort_id', 'resort_name location image description');
		
		if (!room) return res.status(404).json({ message: 'Room not found.' });
		
		// Get booked dates for this room
		const bookedDates = await getBookedDates(room._id);
		
		res.json({
			...room.toObject(),
			booked_dates: bookedDates
		});
	} catch (err) {
		console.error('Error getting room by ID:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update room
exports.updateRoom = async (req, res) => {
	try {
		const { room_type, capacity, price_per_night, status } = req.body;
		
		// Find room first to check ownership
		const existingRoom = await Room.findOne({ _id: req.params.id, deleted: false })
			.populate('resort_id');
		
		if (!existingRoom) {
			return res.status(404).json({ message: 'Room not found.' });
		}

		// Check ownership if auth middleware provides user
		if (req.user && existingRoom.resort_id.owner_id.toString() !== req.user.id) {
			return res.status(403).json({ message: 'Not authorized to update this room.' });
		}

		const room = await Room.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ room_type, capacity, price_per_night, status },
			{ new: true }
		).populate('resort_id', 'resort_name location');
		
		res.json(room);
	} catch (err) {
		console.error('Error updating room:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete room
exports.deleteRoom = async (req, res) => {
	try {
		// Find room first to check ownership
		const existingRoom = await Room.findOne({ _id: req.params.id, deleted: false })
			.populate('resort_id');
		
		if (!existingRoom) {
			return res.status(404).json({ message: 'Room not found.' });
		}

		// Check ownership if auth middleware provides user
		if (req.user && existingRoom.resort_id.owner_id.toString() !== req.user.id) {
			return res.status(403).json({ message: 'Not authorized to delete this room.' });
		}

		const room = await Room.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ deleted: true },
			{ new: true }
		);
		
		res.json({ message: 'Room soft deleted.' });
	} catch (err) {
		console.error('Error deleting room:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};
