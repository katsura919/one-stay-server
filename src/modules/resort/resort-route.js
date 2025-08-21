const express = require('express');
const router = express.Router();
const resortController = require('./resort-controller');

router.post('/', resortController.createResort);
router.get('/', resortController.getAllResorts);
router.get('/search', resortController.searchResorts);
router.get('/:id', resortController.getResortById);
router.put('/:id', resortController.updateResort);
router.delete('/:id', resortController.deleteResort);

module.exports = router;
