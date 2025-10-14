const User = require('../../models/user-model');
const bcrypt = require('bcryptjs');

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

// Update user profile (username and email only)
exports.updateUserProfile = async (req, res) => {
	try {
		const { username, email } = req.body;
		const userId = req.params.id;

		// Validate input
		if (!username && !email) {
			return res.status(400).json({ message: 'At least one field (username or email) is required.' });
		}

		// Check if user exists
		const existingUser = await User.findOne({ _id: userId, deleted: false });
		if (!existingUser) {
			return res.status(404).json({ message: 'User not found.' });
		}

		// Check if username is already taken by another user
		if (username && username !== existingUser.username) {
			const usernameExists = await User.findOne({ username, _id: { $ne: userId }, deleted: false });
			if (usernameExists) {
				return res.status(400).json({ message: 'Username is already taken.' });
			}
		}

		// Check if email is already taken by another user
		if (email && email !== existingUser.email) {
			const emailExists = await User.findOne({ email, _id: { $ne: userId }, deleted: false });
			if (emailExists) {
				return res.status(400).json({ message: 'Email is already taken.' });
			}
		}

		// Update user profile
		const updateData = {};
		if (username) updateData.username = username;
		if (email) updateData.email = email;

		const user = await User.findOneAndUpdate(
			{ _id: userId, deleted: false },
			updateData,
			{ new: true }
		).select('-password');

		res.json({ 
			message: 'Profile updated successfully.',
			user 
		});
	} catch (err) {
		console.error('Update profile error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Change user password
exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.params.id;

		// Validate input
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: 'Current password and new password are required.' });
		}

		// Validate new password strength
		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
		}

		// Find user
		const user = await User.findOne({ _id: userId, deleted: false });
		if (!user) {
			return res.status(404).json({ message: 'User not found.' });
		}

		// Verify current password
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Current password is incorrect.' });
		}

		// Check if new password is same as current password
		const isSamePassword = await bcrypt.compare(newPassword, user.password);
		if (isSamePassword) {
			return res.status(400).json({ message: 'New password must be different from current password.' });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password
		user.password = hashedPassword;
		await user.save();

		res.json({ message: 'Password changed successfully.' });
	} catch (err) {
		console.error('Change password error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Update user (admin function - can update role)
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
