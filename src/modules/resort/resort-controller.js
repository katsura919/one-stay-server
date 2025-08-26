const Resort = require('../../models/resort-model');
const { uploadImage, deleteImage, extractPublicId } = require('../../utils/cloudinary');

// Create a resort
exports.createResort = async (req, res) => {
	try {
		const { resort_name, location, description } = req.body;
		const owner_id = req.user._id; // Get owner ID from authenticated user
		
		let imageUrl = null;
		
		// Handle image upload if file is provided
		if (req.file) {
			try {
				const uploadResult = await uploadImage(req.file.buffer, {
					public_id: `resort_${owner_id}_${Date.now()}`
				});
				imageUrl = uploadResult.secure_url;
			} catch (uploadError) {
				console.error('Image upload error:', uploadError);
				return res.status(400).json({ message: 'Image upload failed. Please try again.' });
			}
		}
		
		const resort = new Resort({ 
			owner_id, 
			resort_name, 
			location, 
			description, 
			image: imageUrl 
		});
		await resort.save();
		res.status(201).json(resort);
	} catch (err) {
		console.error('Create resort error:', err);
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
				{ 'location.address': { $regex: q, $options: 'i' } }
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

// Get resort by owner ID
exports.getResortByOwnerId = async (req, res) => {
	try {
		const { owner_id } = req.params;
		const resort = await Resort.findOne({ owner_id, deleted: false });
		if (!resort) return res.status(404).json({ message: 'Resort not found for this owner.' });
		res.json(resort);
	} catch (err) {
		console.error('Get resort by owner ID error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get current owner's resort (using authenticated user)
exports.getMyResort = async (req, res) => {
	try {
		const owner_id = req.user._id; // Get owner ID from authenticated user
		const resort = await Resort.findOne({ owner_id, deleted: false });
		if (!resort) return res.status(404).json({ message: 'No resort found for your account.' });
		res.json(resort);
	} catch (err) {
		console.error('Get my resort error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update resort
exports.updateResort = async (req, res) => {
	try {
		const { resort_name, location, description } = req.body;
		
		// First, get the existing resort to check for existing image
		const existingResort = await Resort.findById(req.params.id);
		if (!existingResort) {
			return res.status(404).json({ message: 'Resort not found.' });
		}
		
		let imageUrl = existingResort.image; // Keep existing image by default
		
		// Handle new image upload if file is provided
		if (req.file) {
			try {
				// Delete old image from Cloudinary if it exists
				if (existingResort.image) {
					const oldPublicId = extractPublicId(existingResort.image);
					if (oldPublicId) {
						await deleteImage(oldPublicId);
					}
				}
				
				// Upload new image
				const uploadResult = await uploadImage(req.file.buffer, {
					public_id: `resort_${existingResort.owner_id}_${Date.now()}`
				});
				imageUrl = uploadResult.secure_url;
			} catch (uploadError) {
				console.error('Image upload error:', uploadError);
				return res.status(400).json({ message: 'Image upload failed. Please try again.' });
			}
		}
		
		const resort = await Resort.findByIdAndUpdate(
			req.params.id,
			{ resort_name, location, description, image: imageUrl },
			{ new: true }
		);
		
		res.json(resort);
	} catch (err) {
		console.error('Update resort error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Delete resort (soft delete)
exports.deleteResort = async (req, res) => {
	try {
		const existingResort = await Resort.findById(req.params.id);
		if (!existingResort) {
			return res.status(404).json({ message: 'Resort not found.' });
		}
		
		// Delete image from Cloudinary if it exists
		if (existingResort.image) {
			try {
				const publicId = extractPublicId(existingResort.image);
				if (publicId) {
					await deleteImage(publicId);
				}
			} catch (deleteError) {
				console.error('Error deleting image from Cloudinary:', deleteError);
				// Continue with resort deletion even if image deletion fails
			}
		}
		
		const resort = await Resort.findByIdAndUpdate(
			req.params.id,
			{ deleted: true },
			{ new: true }
		);
		
		res.json({ message: 'Resort deleted.' });
	} catch (err) {
		console.error('Delete resort error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Upload/Update resort image only
exports.uploadResortImage = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No image file provided.' });
		}
		
		const resort = await Resort.findById(req.params.id);
		if (!resort) {
			return res.status(404).json({ message: 'Resort not found.' });
		}
		
		// Check if user owns this resort
		if (resort.owner_id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to update this resort.' });
		}
		
		try {
			// Delete old image from Cloudinary if it exists
			if (resort.image) {
				const oldPublicId = extractPublicId(resort.image);
				if (oldPublicId) {
					await deleteImage(oldPublicId);
				}
			}
			
			// Upload new image
			const uploadResult = await uploadImage(req.file.buffer, {
				public_id: `resort_${resort.owner_id}_${Date.now()}`
			});
			
			// Update resort with new image URL
			resort.image = uploadResult.secure_url;
			await resort.save();
			
			res.json({ 
				message: 'Image uploaded successfully.',
				imageUrl: uploadResult.secure_url,
				resort: resort
			});
		} catch (uploadError) {
			console.error('Image upload error:', uploadError);
			return res.status(400).json({ message: 'Image upload failed. Please try again.' });
		}
	} catch (err) {
		console.error('Upload resort image error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};
