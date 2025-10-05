const Chat = require('../../models/chat-model');
const { emitToChat, emitToUser } = require('../../libs/chat-socket');

// Send a message (creates chat if it doesn't exist)
exports.sendMessage = async (req, res) => {
	try {
		const { customer_id, resort_id, sender, text } = req.body;
		
		// Input validation
		if (!customer_id || !resort_id || !sender || !text) {
			return res.status(400).json({ message: 'Customer ID, Resort ID, sender, and text are required.' });
		}

		if (!['customer', 'owner'].includes(sender)) {
			return res.status(400).json({ message: 'Sender must be either "customer" or "owner".' });
		}

		// Find existing chat or create a new one
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

		// Add the message to the chat
		chat.messages.push({ sender, text });
		await chat.save();

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
		console.error('Send message error:', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get chat history with pagination (recent messages first)
exports.getChat = async (req, res) => {
	try {
		const { limit = 5, skip = 0 } = req.query;
		const pageLimit = Math.min(parseInt(limit), 50); // Max 50 messages per request
		const skipCount = parseInt(skip) || 0;
		
		const chat = await Chat.findOne({ _id: req.params.id, deleted: false })
			.populate('customer_id', 'username email')
			.populate('resort_id', 'resort_name location');
			
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		
		// Get total message count
		const totalMessages = chat.messages.length;
		
		// Get paginated messages (most recent first, then reverse for correct order)
		const messages = chat.messages
			.slice(-pageLimit - skipCount, totalMessages - skipCount)
			.reverse()
			.slice(0, pageLimit)
			.reverse();
		
		// Return chat with paginated messages and pagination info
		const response = {
			_id: chat._id,
			customer_id: chat.customer_id,
			resort_id: chat.resort_id,
			messages,
			createdAt: chat.createdAt,
			deleted: chat.deleted,
			pagination: {
				totalMessages,
				currentPage: Math.floor(skipCount / pageLimit) + 1,
				messagesPerPage: pageLimit,
				hasMore: totalMessages > skipCount + pageLimit,
				remaining: Math.max(0, totalMessages - skipCount - pageLimit)
			}
		};
		
		res.json(response);
	} catch (err) {
		console.error('Get chat error:', err);
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

// Load older messages with pagination
exports.loadMoreMessages = async (req, res) => {
	try {
		const { id } = req.params;
		const { limit = 10, skip = 0 } = req.query;
		const pageLimit = Math.min(parseInt(limit), 50); // Max 50 messages per request
		const skipCount = parseInt(skip) || 0;
		
		const chat = await Chat.findOne({ _id: id, deleted: false });
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		
		const totalMessages = chat.messages.length;
		
		// Get older messages (working backwards from the end)
		const startIndex = Math.max(0, totalMessages - skipCount - pageLimit);
		const endIndex = totalMessages - skipCount;
		
		const messages = chat.messages.slice(startIndex, endIndex);
		
		const response = {
			messages,
			pagination: {
				totalMessages,
				currentSkip: skipCount,
				messagesPerPage: pageLimit,
				hasMore: startIndex > 0,
				remaining: startIndex
			}
		};
		
		res.json(response);
	} catch (err) {
		console.error('Load more messages error:', err);
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
