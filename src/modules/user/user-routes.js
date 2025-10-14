const express = require('express');
const router = express.Router();
const userController = require('./user-controller');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/profile', userController.updateUserProfile); // Update username and email
router.put('/:id/password', userController.changePassword); // Change password
router.delete('/:id', userController.deleteUser);

module.exports = router;
