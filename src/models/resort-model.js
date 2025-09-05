const mongoose = require('mongoose');


const resortSchema = new mongoose.Schema({
	owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	resort_name: { type: String, required: true },
	location: {
		address: { type: String, required: true }, 
		latitude: { type: Number, required: true }, 
		longitude: { type: Number, required: true } 
	},
	description: { type: String },
	image: { type: String }, 
	createdAt: { type: Date, default: Date.now },
	deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Resort', resortSchema);
  