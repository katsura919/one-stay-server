const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/auth/auth-routes');
const userRoutes = require('./modules/user/user-routes');
const resortRoutes = require('./modules/resort/resort-route');
const roomRoutes = require('./modules/room/room-routes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/resort', resortRoutes);
router.use('/room', roomRoutes);

module.exports = router;
