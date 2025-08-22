const { Server } = require('socket.io');
const Chat = require('../models/chat-model');

let io;

// Initialize Socket.IO
const initializeSocket = (httpServer) => {
	io = new Server(httpServer, {
		cors: {
			origin: "*", // Configure this for production
			methods: ["GET", "POST"],
			credentials: true
		}
	});

	// Store connected users
	const connectedUsers = new Map();
	
	io.on('connection', (socket) => {
		console.log(`User connected: ${socket.id}`);

		// User joins with their user ID
		socket.on('join', (userData) => {
			const { userId, role } = userData;
			
			// Store user data
			connectedUsers.set(socket.id, { userId, role, socketId: socket.id });
			
			// Join user to their personal room
			socket.join(`user_${userId}`);
			
			console.log(`User ${userId} (${role}) joined with socket ${socket.id}`);
			
			// Emit to user that they've joined successfully
			socket.emit('joined', { userId, socketId: socket.id });
		});

		// Join a specific chat between customer and owner
		socket.on('join_chat', (chatId) => {
			socket.join(`chat_${chatId}`);
			console.log(`Socket ${socket.id} joined chat ${chatId}`);
			
			// Notify the other user in the chat
			socket.to(`chat_${chatId}`).emit('user_joined_chat', {
				socketId: socket.id,
				chatId
			});
		});

		// Leave a specific chat
		socket.on('leave_chat', (chatId) => {
			socket.leave(`chat_${chatId}`);
			console.log(`Socket ${socket.id} left chat ${chatId}`);
			
			// Notify the other user in the chat
			socket.to(`chat_${chatId}`).emit('user_left_chat', {
				socketId: socket.id,
				chatId
			});
		});

		// Handle sending messages
		socket.on('send_message', async (messageData) => {
			try {
				const { chatId, sender, text, senderId } = messageData;

				// Validate message data
				if (!chatId || !sender || !text) {
					socket.emit('error', { message: 'Invalid message data' });
					return;
				}

				// Find the chat and add the message
				const chat = await Chat.findOne({ _id: chatId, deleted: false });
				if (!chat) {
					socket.emit('error', { message: 'Chat not found' });
					return;
				}

				// Add message to chat
				const newMessage = {
					sender,
					text,
					timestamp: new Date()
				};
				
				chat.messages.push(newMessage);
				await chat.save();

				// Get the saved message with ID
				const savedMessage = chat.messages[chat.messages.length - 1];
				
				const messageWithMetadata = {
					...savedMessage.toObject(),
					chatId,
					senderId
				};

				// Emit to all users in the chat room
				io.to(`chat_${chatId}`).emit('receive_message', messageWithMetadata);
				
				// Emit to sender for confirmation
				socket.emit('message_sent', {
					messageId: savedMessage._id,
					chatId,
					timestamp: savedMessage.timestamp
				});

				console.log(`Message sent in chat ${chatId} by ${sender}`);

			} catch (error) {
				console.error('Error sending message:', error);
				socket.emit('error', { message: 'Failed to send message' });
			}
		});

		// Handle message read receipts
		socket.on('mark_read', async (data) => {
			try {
				const { chatId, userId } = data;
				
				// Emit to the other user in chat that messages have been read
				socket.to(`chat_${chatId}`).emit('messages_read', {
					chatId,
					readBy: userId,
					readAt: new Date()
				});

			} catch (error) {
				console.error('Error marking messages as read:', error);
			}
		});

		// Handle getting online status for the other user in chat
		socket.on('get_chat_status', (chatId) => {
			const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
			const isOtherUserOnline = room && room.size > 1; // More than just this user
			
			socket.emit('chat_status', { 
				chatId, 
				isOtherUserOnline 
			});
		});

		// Handle user disconnect
		socket.on('disconnect', () => {
			const userData = connectedUsers.get(socket.id);
			
			if (userData) {
				console.log(`User ${userData.userId} disconnected`);
				
				// Remove from connected users
				connectedUsers.delete(socket.id);
				
				// Notify all chats this user was in
				socket.rooms.forEach(room => {
					if (room.startsWith('chat_')) {
						socket.to(room).emit('user_offline', {
							userId: userData.userId,
							role: userData.role
						});
					}
				});
			}
			
			console.log(`Socket disconnected: ${socket.id}`);
		});

		// Handle errors
		socket.on('error', (error) => {
			console.error('Socket error:', error);
		});
	});

	return io;
};

// Utility function to emit to specific user
const emitToUser = (userId, event, data) => {
	if (io) {
		io.to(`user_${userId}`).emit(event, data);
	}
};

// Utility function to emit to specific chat
const emitToChat = (chatId, event, data) => {
	if (io) {
		io.to(`chat_${chatId}`).emit(event, data);
	}
};

// Utility function to get chat participants count
const getChatParticipantsCount = (chatId) => {
	if (!io) return 0;
	
	const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
	return room ? room.size : 0;
};

// Utility function to check if other user is online in chat
const isOtherUserOnlineInChat = (chatId, currentUserId) => {
	if (!io) return false;
	
	const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
	if (!room || room.size <= 1) return false;
	
	// Check if there's another user besides the current one
	for (const socketId of room) {
		const userData = connectedUsers.get(socketId);
		if (userData && userData.userId !== currentUserId) {
			return true;
		}
	}
	return false;
};

module.exports = {
	initializeSocket,
	emitToUser,
	emitToChat,
	getChatParticipantsCount,
	isOtherUserOnlineInChat,
	getIO: () => io
};
