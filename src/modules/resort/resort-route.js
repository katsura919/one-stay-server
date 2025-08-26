const express = require('express');
const router = express.Router();
const resortController = require('./resort-controller');
const { authMiddleware, ownerOnly } = require('../../middleware/auth');
const { uploadSingle, handleMulterError } = require('../../middleware/upload');
const { logFormData } = require('../../middleware/debug');

// Public routes
router.get('/', resortController.getAllResorts);
router.get('/search', resortController.searchResorts);
router.get('/:id', resortController.getResortById);
router.get('/owner/:owner_id', resortController.getResortByOwnerId);

// Protected routes (require authentication)
router.get('/my/resort', authMiddleware, ownerOnly, resortController.getMyResort);
router.post('/', authMiddleware, ownerOnly, uploadSingle, handleMulterError, logFormData, resortController.createResort);
router.put('/:id', authMiddleware, ownerOnly, uploadSingle, handleMulterError, logFormData, resortController.updateResort);
router.put('/:id/image', authMiddleware, ownerOnly, uploadSingle, handleMulterError, resortController.uploadResortImage);
router.delete('/:id', authMiddleware, ownerOnly, resortController.deleteResort);

module.exports = router;
