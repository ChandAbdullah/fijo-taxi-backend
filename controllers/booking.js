const http_status_codes = require('http-status-codes');
const sequelize = require("sequelize");
const op = sequelize.Op;
const {
    Booking,
    Driver,
    Comission
} = require('../database/database');

module.exports = {


    async findDrivers(req, res, next) {
        try {
            
            const {
                carSizeId,
                city

            } = req.body;
            const drivers = await Driver.findAll({

                where: {
                    [op.and]:
                        [
                            { city: city },
                            { isAvailable: true }
                        ]
                },
                include: [
                    {
                        model: Vehicle,
                        where: { carSizeId: carSizeId }
                    }
                ]
            });
            return res.status(http_status_codes.OK).json(drivers);
        }
        catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in finding drivers"
            });
        }
    },

    async createBooking(req, res, next) {
        try { 
            const {
                cost,
                pickup,
                destination,
                driverId,
                passengerId
            } = req.body;

            const booking = await Booking.create({
                cost: cost,
                pickup: pickup,
                destination: destination,
                driverId: driverId,
                passengerId: passengerId
            });

            // if (booking) {
            //     const comissions = await Comission.findAll();
            //     const driver = await Driver.findOne({ where: { id: driverId } });
            //     let balanceToUpdate = driver.balance + (booking.cost * comissions[0].customerComissionRate);
            //     driver.update({
            //         balance: balanceToUpdate
            //     });
            //     return res.status(http_status_codes.CREATED).json({ message: 'Booking Created Successfully' });
            // }

        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Creating Booking"
            });
        }
    },

    async getAllDriverBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll({ where: { driverId: driverId } });
            return res.status(http_status_codes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllDriverBookings"
            });
        }
    },

    async getAllCustomerBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll({ where: { passengerId: passengerId } });
            return res.status(http_status_codes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllCustomerBookings"
            });
        }
    },

    async getAllBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll();
            return res.status(http_status_codes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllBookings"
            });
        }
    },
};