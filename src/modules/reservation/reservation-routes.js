const express = require('express');
const router = express.Router();
const reservationController = require('./reservation-controller');
const authMiddleware = require('../../middleware/auth');
const { validateReservationDates, validateRoomId, validateReservationId } = require('../../middleware/reservationValidation');

// Public routes - Check availability and get booked dates
router.get('/availability/:roomId', validateRoomId, reservationController.checkAvailability);
router.get('/booked-dates/:roomId', validateRoomId, reservationController.getBookedDatesForRoom);

// Protected routes - Require authentication
router.use(authMiddleware); // Apply auth middleware to all routes below

// Customer routes
router.post('/', validateReservationDates, validateRoomId, reservationController.createReservation);
router.get('/my-reservations', reservationController.getUserReservations);
router.delete('/:reservationId', validateReservationId, reservationController.cancelReservation);

// Owner routes
router.get('/owner-reservations', reservationController.getOwnerReservations);
router.put('/:reservationId/status', validateReservationId, reservationController.updateReservationStatus);

// Legacy routes for backward compatibility
router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);

module.exports = router;
