const express = require('express');
const router = express.Router();



const authRoutes = require('./modules/auth/auth-routes');
const userRoutes = require('./modules/user/user-routes');
const resortRoutes = require('./modules/resort/resort-route');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/resort', resortRoutes);

module.exports = router;
