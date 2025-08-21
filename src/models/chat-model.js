const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
	customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	resort_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort', required: true },
	messages: [
		{
			sender: { type: String, enum: ['customer', 'owner'], required: true },
			text: { type: String, required: true },
			timestamp: { type: Date, default: Date.now }
		}
	],
	createdAt: { type: Date, default: Date.now },
	deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Chat', chatSchema);
