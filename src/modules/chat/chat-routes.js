const express = require('express');
const router = express.Router();
const chatController = require('./chat-controller');

router.post('/start', chatController.startChat);
router.post('/send', chatController.sendMessage);
router.get('/:id', chatController.getChat);

module.exports = router;
