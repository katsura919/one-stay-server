const Amenity = require('../../models/amenity-model');
const Resort = require('../../models/resort-model');

// Create a new amenity
const createAmenity = async (req, res) => {
	try {
		const { resort_id, name } = req.body;

		// Check if resort exists
		const resort = await Resort.findById(resort_id);
		if (!resort) {
			return res.status(404).json({ message: 'Resort not found' });
		}

		const amenity = new Amenity({
			resort_id,
			name
		});

		const savedAmenity = await amenity.save();
		res.status(201).json(savedAmenity);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all amenities for a specific resort
const getAmenitiesByResort = async (req, res) => {
	try {
		const { resort_id } = req.params;
		
		const amenities = await Amenity.find({ 
			resort_id, 
			deleted: false 
		}).populate('resort_id', 'resort_name');
		
		res.status(200).json(amenities);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all amenities
const getAllAmenities = async (req, res) => {
	try {
		const amenities = await Amenity.find({ deleted: false })
			.populate('resort_id', 'resort_name');
		
		res.status(200).json(amenities);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get amenity by ID
const getAmenityById = async (req, res) => {
	try {
		const { id } = req.params;
		
		const amenity = await Amenity.findById(id)
			.populate('resort_id', 'resort_name');
		
		if (!amenity || amenity.deleted) {
			return res.status(404).json({ message: 'Amenity not found' });
		}
		
		res.status(200).json(amenity);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update amenity
const updateAmenity = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const amenity = await Amenity.findById(id);
		if (!amenity || amenity.deleted) {
			return res.status(404).json({ message: 'Amenity not found' });
		}

		if (name) amenity.name = name;

		const updatedAmenity = await amenity.save();
		res.status(200).json(updatedAmenity);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Delete amenity (soft delete)
const deleteAmenity = async (req, res) => {
	try {
		const { id } = req.params;

		const amenity = await Amenity.findById(id);
		if (!amenity || amenity.deleted) {
			return res.status(404).json({ message: 'Amenity not found' });
		}

		amenity.deleted = true;
		await amenity.save();

		res.status(200).json({ message: 'Amenity deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	createAmenity,
	getAmenitiesByResort,
	getAllAmenities,
	getAmenityById,
	updateAmenity,
	deleteAmenity
};