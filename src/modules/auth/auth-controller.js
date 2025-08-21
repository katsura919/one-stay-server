const User = require('../../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
	try {
		const { username, email, password, role } = req.body;
		if (!username || !email || !password || !role) {
			return res.status(400).json({ message: 'All fields are required.' });
		}
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res.status(409).json({ message: 'User already exists.' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, email, password: hashedPassword, role });
		await user.save();
		res.status(201).json({ message: 'User registered successfully.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' });
		}
	const user = await User.findOne({ email, deleted: false });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}
		const token = jwt.sign(
			{ userId: user._id, role: user.role },
			process.env.JWT_SECRET || 'secretkey'
		);
		res.json({ token, user: { username: user.username, email: user.email, role: user.role } });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
