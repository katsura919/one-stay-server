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

		// Join a specific chat room
		socket.on('join_chat', (chatId) => {
			socket.join(`chat_${chatId}`);
			console.log(`Socket ${socket.id} joined chat ${chatId}`);
			
			// Notify others in the chat room
			socket.to(`chat_${chatId}`).emit('user_joined_chat', {
				socketId: socket.id,
				chatId
			});
		});

		// Leave a specific chat room
		socket.on('leave_chat', (chatId) => {
			socket.leave(`chat_${chatId}`);
			console.log(`Socket ${socket.id} left chat ${chatId}`);
			
			// Notify others in the chat room
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

		// Handle typing indicators
		socket.on('typing_start', (data) => {
			const { chatId, userId, username } = data;
			socket.to(`chat_${chatId}`).emit('user_typing', {
				userId,
				username,
				chatId,
				isTyping: true
			});
		});

		socket.on('typing_stop', (data) => {
			const { chatId, userId } = data;
			socket.to(`chat_${chatId}`).emit('user_typing', {
				userId,
				chatId,
				isTyping: false
			});
		});

		// Handle message read receipts
		socket.on('mark_read', async (data) => {
			try {
				const { chatId, userId } = data;
				
				// Emit to all users in chat that messages have been read
				socket.to(`chat_${chatId}`).emit('messages_read', {
					chatId,
					readBy: userId,
					readAt: new Date()
				});

			} catch (error) {
				console.error('Error marking messages as read:', error);
			}
		});

		// Handle getting online users for a chat
		socket.on('get_online_users', (chatId) => {
			const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
			const onlineUsers = [];
			
			if (room) {
				room.forEach(socketId => {
					const userData = connectedUsers.get(socketId);
					if (userData) {
						onlineUsers.push({
							userId: userData.userId,
							role: userData.role
						});
					}
				});
			}
			
			socket.emit('online_users', { chatId, users: onlineUsers });
		});

		// Handle user disconnect
		socket.on('disconnect', () => {
			const userData = connectedUsers.get(socket.id);
			
			if (userData) {
				console.log(`User ${userData.userId} disconnected`);
				
				// Remove from connected users
				connectedUsers.delete(socket.id);
				
				// Notify all rooms this user was in
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

// Utility function to get connected users count
const getConnectedUsersCount = () => {
	return io ? io.engine.clientsCount : 0;
};

// Utility function to get users in a specific chat
const getUsersInChat = (chatId) => {
	if (!io) return [];
	
	const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
	const users = [];
	
	if (room) {
		room.forEach(socketId => {
			const socket = io.sockets.sockets.get(socketId);
			if (socket && socket.userData) {
				users.push(socket.userData);
			}
		});
	}
	
	return users;
};

module.exports = {
	initializeSocket,
	emitToUser,
	emitToChat,
	getConnectedUsersCount,
	getUsersInChat,
	getIO: () => io
};
