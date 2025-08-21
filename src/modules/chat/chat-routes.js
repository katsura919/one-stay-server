const express = require('express');
const router = express.Router();
const chatController = require('./chat-controller');

router.post('/start', chatController.startChat);
router.post('/send', chatController.sendMessage);
router.get('/user/:user_id', chatController.getUserChats);
router.get('/resort/:resort_id/chats', chatController.getResortChats);
router.get('/:id', chatController.getChat);
router.put('/:id/read', chatController.markAsRead);
router.delete('/:id', chatController.deleteChat);

module.exports = router;
