const express = require('express');
const router = express.Router();
const {
	createAmenity,
	getAmenitiesByResort,
	getAllAmenities,
	getAmenityById,
	updateAmenity,
	deleteAmenity
} = require('./amenity-controller');

// Create a new amenity
router.post('/', createAmenity);

// Get all amenities
router.get('/', getAllAmenities);

// Get amenities by resort ID
router.get('/resort/:resort_id', getAmenitiesByResort);

// Get amenity by ID
router.get('/:id', getAmenityById);

// Update amenity
router.put('/:id', updateAmenity);

// Delete amenity (soft delete)
router.delete('/:id', deleteAmenity);

module.exports = router;