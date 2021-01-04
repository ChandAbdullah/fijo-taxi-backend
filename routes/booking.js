var express = require('express');
var router = express.Router();
const bookingController = require('../controllers/booking');


router.post('/create', bookingController.createBooking);
router.get('/getall-driver-bookings/:driverId', bookingController.getAllDriverBookings);
router.get('/getall-customer-bookings/:passengerId', bookingController.getAllCustomerBookings);
router.get('/getall-bookings', bookingController.getAllBookings);
router.post('/calculate-estimated-price', bookingController.calculateEstimatedPrice);
router.post('/find-nearby-drivers', bookingController.findNearByDrivers);


module.exports = router;

