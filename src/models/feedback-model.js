const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
	reservation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
	rating: { type: Number, min: 1, max: 5, required: true },
	comment: { type: String },
	createdAt: { type: Date, default: Date.now },
	deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
