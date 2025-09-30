const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
	// Who is giving the feedback
	from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	// Who is receiving the feedback
	to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	// Related room and reservation
	room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
	reservation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
	// Feedback type: 'customer_to_owner' or 'owner_to_customer'
	feedback_type: { 
		type: String, 
		enum: ['customer_to_owner', 'owner_to_customer'], 
		required: true 
	},
	// Rating and comment
	rating: { type: Number, min: 1, max: 5, required: true },
	comment: { type: String, maxLength: 500 },
	// Timestamps
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	deleted: { type: Boolean, default: false }
});

// Compound index to prevent duplicate feedback for same reservation and type
feedbackSchema.index({ 
	reservation_id: 1, 
	from_user_id: 1, 
	feedback_type: 1 
}, { unique: true });

// Update the updatedAt field before saving
feedbackSchema.pre('save', function(next) {
	this.updatedAt = Date.now();
	next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
