const Chat = require('../../models/chat-model');
const { emitToChat, emitToUser } = require('../../libs/socket');

// Start a chat (or get existing)
exports.startChat = async (req, res) => {
	try {
		const { customer_id, resort_id } = req.body;
		
		// Input validation
		if (!customer_id || !resort_id) {
			return res.status(400).json({ message: 'Customer ID and Resort ID are required.' });
		}

		let chat = await Chat.findOne({ customer_id, resort_id, deleted: false })
			.populate('customer_id', 'username email')
			.populate('resort_id', 'resort_name location');
		
		let isNewChat = false;
		if (!chat) {
			chat = new Chat({ customer_id, resort_id, messages: [] });
			await chat.save();
			isNewChat = true;
			// Populate after saving
			chat = await Chat.findById(chat._id)
				.populate('customer_id', 'username email')
				.populate('resort_id', 'resort_name location');
		}

		// If it's a new chat, notify the resort owner via Socket.IO
		if (isNewChat) {
			emitToUser(resort_id, 'new_chat', {
				chatId: chat._id,
				customer: chat.customer_id,
				resort: chat.resort_id
			});
		}

		res.json(chat);
	} catch (err) {
		console.error('Start chat error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Send a message
exports.sendMessage = async (req, res) => {
	try {
		const { chat_id, sender, text } = req.body;
		
		// Input validation
		if (!chat_id || !sender || !text) {
			return res.status(400).json({ message: 'Chat ID, sender, and text are required.' });
		}

		if (!['customer', 'owner'].includes(sender)) {
			return res.status(400).json({ message: 'Sender must be either "customer" or "owner".' });
		}

		const chat = await Chat.findOne({ _id: chat_id, deleted: false })
			.populate('customer_id', 'username email')
			.populate('resort_id', 'resort_name location');
		
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		
		chat.messages.push({ sender, text });
		await chat.save();
		res.json(chat);
	} catch (err) {
		console.error('Send message error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get chat history
exports.getChat = async (req, res) => {
	try {
		const chat = await Chat.findOne({ _id: req.params.id, deleted: false })
			.populate('customer_id', 'username email')
			.populate('resort_id', 'resort_name location');
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		res.json(chat);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get all chats for a specific user/customer
exports.getUserChats = async (req, res) => {
	try {
		const { user_id } = req.params;
		const chats = await Chat.find({ customer_id: user_id, deleted: false })
			.populate('customer_id', 'username email')
			.populate('resort_id', 'resort_name location')
			.sort({ createdAt: -1 });
		res.json(chats);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get all chats for a specific resort (for resort owners)
exports.getResortChats = async (req, res) => {
	try {
		const { resort_id } = req.params;
		const chats = await Chat.find({ resort_id, deleted: false })
			.populate('customer_id', 'username email')
			.populate('resort_id', 'resort_name location')
			.sort({ createdAt: -1 });
		res.json(chats);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Mark messages as read (can be extended to mark specific messages)
exports.markAsRead = async (req, res) => {
	try {
		const { id } = req.params;
		const chat = await Chat.findOne({ _id: id, deleted: false });
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		
		// For now, we'll just return success. This can be extended to track read status per message
		res.json({ message: 'Messages marked as read.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Soft delete chat
exports.deleteChat = async (req, res) => {
	try {
		const chat = await Chat.findOneAndUpdate(
			{ _id: req.params.id, deleted: false },
			{ deleted: true },
			{ new: true }
		);
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		res.json({ message: 'Chat soft deleted.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
