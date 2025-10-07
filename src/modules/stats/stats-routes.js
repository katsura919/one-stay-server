const express = require('express');
const router = express.Router();
const statsController = require('./stats-controller');
const { authMiddleware } = require('../../middleware/auth');


router.get('/resort/:resortId', statsController.getResortStats);


router.get('/resort/:resortId/rating', statsController.getResortAverageRating);


router.get('/resort/:resortId/rooms', statsController.getResortTotalRooms);


router.get('/resort/:resortId/reservations', authMiddleware, statsController.getResortTotalReservations);

router.get('/resort/:resortId/feedbacks', statsController.getResortTotalFeedbacks);

module.exports = router;
