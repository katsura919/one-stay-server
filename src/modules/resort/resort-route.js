const express = require('express');
const router = express.Router();
const resortController = require('./resort-controller');
const { authMiddleware, ownerOnly } = require('../../middleware/auth');

// Public routes
router.get('/', resortController.getAllResorts);
router.get('/search', resortController.searchResorts);
router.get('/:id', resortController.getResortById);
router.get('/owner/:owner_id', resortController.getResortByOwnerId);

// Protected routes (require authentication)
router.get('/my/resort', authMiddleware, ownerOnly, resortController.getMyResort);
router.post('/', authMiddleware, ownerOnly, resortController.createResort);
router.put('/:id', authMiddleware, ownerOnly, resortController.updateResort);
router.delete('/:id', authMiddleware, ownerOnly, resortController.deleteResort);

module.exports = router;
