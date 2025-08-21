const Resort = require('../../models/resort-model');

// Create a resort
exports.createResort = async (req, res) => {
	try {
		const { owner_id, resort_name, location, description, image } = req.body;
		const resort = new Resort({ owner_id, resort_name, location, description, image });
		await resort.save();
		res.status(201).json(resort);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};


// Get all resorts (excluding soft deleted)
exports.getAllResorts = async (req, res) => {
	try {
		const resorts = await Resort.find({ deleted: false });
		res.json(resorts);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Search resorts by name or location (excluding soft deleted)
exports.searchResorts = async (req, res) => {
	try {
		const { q } = req.query;
		const query = {
			deleted: false,
			$or: [
				{ resort_name: { $regex: q, $options: 'i' } },
				{ location: { $regex: q, $options: 'i' } }
			]
		};
		const resorts = await Resort.find(q ? query : { deleted: false });
		res.json(resorts);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get resort by ID
exports.getResortById = async (req, res) => {
	try {
		const resort = await Resort.findById(req.params.id);
		if (!resort) return res.status(404).json({ message: 'Resort not found.' });
		res.json(resort);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update resort
exports.updateResort = async (req, res) => {
	try {
		const { resort_name, location, description, image } = req.body;
		const resort = await Resort.findByIdAndUpdate(
			req.params.id,
			{ resort_name, location, description, image },
			{ new: true }
		);
		if (!resort) return res.status(404).json({ message: 'Resort not found.' });
		res.json(resort);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Delete resort
exports.deleteResort = async (req, res) => {
	try {
		const resort = await Resort.findByIdAndDelete(req.params.id);
		if (!resort) return res.status(404).json({ message: 'Resort not found.' });
		res.json({ message: 'Resort deleted.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
