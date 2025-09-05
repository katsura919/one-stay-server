const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
	resort_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort', required: true },
	name: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Amenity', amenitySchema);
