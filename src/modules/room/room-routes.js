const express = require('express');
const router = express.Router();
const roomController = require('./room-controller');
const authMiddleware = require('../../middleware/auth');

// Public routes - Anyone can view rooms
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/resort/:resortId', roomController.getRoomsByResort);

// Protected routes - Require authentication (for owners)
router.use(authMiddleware);

router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
