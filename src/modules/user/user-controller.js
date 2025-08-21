const User = require('../../models/user-model');

// Get all users (excluding soft deleted)
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find({ deleted: false }).select('-password');
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get user by ID
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id, deleted: false }).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update user
exports.updateUser = async (req, res) => {
	try {
		const { username, email, role } = req.body;
		const user = await User.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ username, email, role },
			{ new: true }
		).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete user
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ deleted: true },
			{ new: true }
		).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		res.json({ message: 'User soft deleted.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
