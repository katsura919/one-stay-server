const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
	resort_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort', required: true },
	room_type: { type: String, required: true },
	capacity: { type: Number, required: true },
	status: { type: String, required: true }, // e.g. 'available', 'booked', etc.
	createdAt: { type: Date, default: Date.now },
	deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Room', roomSchema);
