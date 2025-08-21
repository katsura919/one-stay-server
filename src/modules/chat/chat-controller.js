const Chat = require('../../models/chat-model');

// Start a chat (or get existing)
exports.startChat = async (req, res) => {
	try {
		const { customer_id, resort_id } = req.body;
		let chat = await Chat.findOne({ customer_id, resort_id, deleted: false });
		if (!chat) {
			chat = new Chat({ customer_id, resort_id, messages: [] });
			await chat.save();
		}
		res.json(chat);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Send a message
exports.sendMessage = async (req, res) => {
	try {
		const { chat_id, sender, text } = req.body;
		const chat = await Chat.findOne({ _id: chat_id, deleted: false });
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		chat.messages.push({ sender, text });
		await chat.save();
		res.json(chat);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};

// Get chat history
exports.getChat = async (req, res) => {
	try {
		const chat = await Chat.findOne({ _id: req.params.id, deleted: false });
		if (!chat) return res.status(404).json({ message: 'Chat not found.' });
		res.json(chat);
	} catch (err) {
		res.status(500).json({ message: 'Server error.' });
	}
};
