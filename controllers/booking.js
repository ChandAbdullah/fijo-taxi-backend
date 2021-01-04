const { RequestHeaderFieldsTooLarge } = require('http-errors');
const http_status_codes = require('http-status-codes');
const sequelize = require("sequelize");
const op = sequelize.Op;
var geodist = require('geodist');
const {
    Booking,
    Driver,
    Passenger,
    Vehicle,
    Message,
    Conversation

} = require('../database/database');

module.exports = {

    async createBooking(req, res, next) {
        try {
            const {
                pickup,
                destination,
                driverId,
                passengerId,
                status,
                cancellReason,
                totalCost,
                exactPriceForDriver,
                exactPriceForPassenger,
                paymentVia,
                screenShot,
            } = req.body;

            const booking = await Booking.create({
                screenShot: screenShot,
                pickup: pickup,
                destination: destination,
                driverId: driverId,
                passengerId: passengerId,
                status: status,
                cancellReason: cancellReason,
                totalCost: totalCost,
                exactPriceForDriver: exactPriceForDriver,
                exactPriceForPassenger: exactPriceForPassenger,
                paymentVia: paymentVia
            });

            if (booking) {

                const isConExist = await Conversation.findOne({
                    where: {
                        [op.or]:
                            [{
                                [op.and]:
                                    [{ senderId: passengerId },
                                    { receiverId: driverId }]
                            },
                            {
                                [op.and]:
                                    [{ senderId: driverId },
                                    { receiverId: passengerId }]
                            }]
                    }
                });
                if (isConExist) {
                    await Message.destroy({ where: { conversationId: isConExist.id } });
                    await Conversation.destroy({ where: { id: isConExist.id } });
                }

                if (paymentVia === 'card' && status === 'completed') {

                    const driver = await Driver.findOne({ where: { id: driverId } });
                    if (driver) {
                        Driver.update({
                            balance: (exactPriceForDriver + driver.balance),
                            viacard: (exactPriceForDriver + driver.viacard)
                        }, {
                            where: {
                                id: driverId
                            }
                        });
                    }
                } else if (paymentVia === 'cash' && status === 'completed') {

                    const driver = await Driver.findOne({ where: { id: driverId } });
                    if (driver) {
                        Driver.update({
                            balance: (exactPriceForDriver + driver.balance),
                            viacash: (exactPriceForDriver + driver.viacash)
                        }, {
                            where: {
                                id: driverId
                            }
                        });
                    }
                }
            }
            return res.status(http_status_codes.StatusCodes.OK).json({ message: 'Booking Created Successfully' });
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Creating Booking"
            });
        }
    },

    async getAllDriverBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll({ where: { driverId: req.params.driverId }, include: [{ model: Passenger, attributes: ['firstName', 'lastName', 'email', 'profilePhoto'] }] });
            return res.status(http_status_codes.StatusCodes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllDriverBookings"
            });
        }
    },

    async getAllCustomerBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll({ where: { passengerId: req.params.passengerId }, include: [{ model: Driver, attributes: ['firstName', 'lastName', 'email', 'driverPhoto'] }] });
            return res.status(http_status_codes.StatusCodes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllCustomerBookings"
            });
        }
    },

    async getAllBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll({ include: [{ model: Passenger }, { model: Driver }] });
            return res.status(http_status_codes.StatusCodes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllBookings"
            });
        }
    },

    async calculateEstimatedPrice(req, res, next) {
        try {
            const {
                km,
                isMorning,
                isWeekend,
                isAirport,
                seatingCapacity,
                isLite
            } = req.body;
            // morning time starts
            if (km < 25) {
                if (isWeekend == false && isMorning == true) {
                    if (seatingCapacity >= 5 && isLite == false) {
                        //  morning time & seating capacity >= 25
                        let perKmPrice = (1.09 * km);
                        let estimatedPrice = (perKmPrice + 2.0 + 1.5);
                        const price = Math.ceil(estimatedPrice);
                        if (isAirport == true) {

                        } else {
                            res.json({ totalPrice: price, basePrice: 2.0 }); // airportkr rha tha ma tb tk
                        }


                    } else {
                        // morning time & seating capacity is other than >= 25
                        let perKmPrice = (1.09 * km);
                        let estimatedPrice = (perKmPrice + 2.0);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.0 });
                    }
                }
            }
            else if (km > 25) {
                if (isWeekend == false && isMorning == true) {
                    if (seatingCapacity >= 5 && isLite == false) {
                        //  morning time & seating capacity >= 25
                        let perKmPrice = (1.20 * km);
                        let estimatedPrice = (perKmPrice + 2.0 + 1.5);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.0 });

                    } else {
                        // morning time & seating capacity is other than >= 25
                        let perKmPrice = (1.20 * km);
                        let estimatedPrice = (perKmPrice + 2.0);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.0 });
                    }
                }
            }
            // morning time ends

            // night time starts
            if (km < 25) {
                if (isMorning == false) {
                    if (seatingCapacity >= 5 && isLite == false) {
                        //  night time & seating capacity >= 25
                        let perKmPrice = (1.19 * km);
                        let estimatedPrice = (perKmPrice + 2.5 + 2);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.5 });

                    } else {
                        // night time & seating capacity is other than >= 25
                        let perKmPrice = (1.19 * km);
                        let estimatedPrice = (perKmPrice + 2.5);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.5 });
                    }
                }
            }
            else if (km > 25) {
                if (isMorning == false) {
                    if (seatingCapacity >= 5 && isLite == false) {
                        //  night time & seating capacity >= 25
                        let perKmPrice = (1.40 * km);
                        let estimatedPrice = (perKmPrice + 2.5 + 2);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.5 });

                    } else {
                        // night time & seating capacity is other than >= 25
                        let perKmPrice = (1.40 * km);
                        let estimatedPrice = (perKmPrice + 2.5);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.5 });
                    }
                }
            }
            // night time ends

            // day time + weekend starts
            if (km < 25) {
                if (isWeekend == true && isMorning == true) {
                    if (seatingCapacity >= 5 && isLite == false) {
                        //  day time + weekend & seating capacity >= 25
                        let perKmPrice = (1.19 * km);
                        let estimatedPrice = (perKmPrice + 2.0 + 2.0);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.5 });

                    } else {
                        // day time + weekend & seating capacity is other than >= 25
                        let perKmPrice = (1.19 * km);
                        let estimatedPrice = (perKmPrice + 2.5);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.5 });
                    }
                }
            }
            else if (km > 25) {
                if (isWeekend == true && isMorning == true) {
                    if (seatingCapacity >= 5 && isLite == false) {
                        //  day time + weekend & seating capacity >= 25
                        let perKmPrice = (1.40 * km);
                        let estimatedPrice = (perKmPrice + 2.0 + 2.0);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.0 });

                    } else {
                        // day time + weekend & seating capacity is other than >= 25
                        let perKmPrice = (1.40 * 2.5);
                        let estimatedPrice = (perKmPrice + 2.5);
                        const price = Math.ceil(estimatedPrice);
                        res.json({ totalPrice: price, basePrice: 2.0 });
                    }
                }
            }
            // day time + weekend ends

            // short distance & morning time starts
            if (km < 3 && isWeekend == false && isMorning == true) {
                res.json({ totalPrice: 4 });
            }
            // short distance & morning time ends

            // short distance & morning time & weekend starts
            if (km < 3 && isWeekend == true && isMorning == true) {
                res.json({ totalPrice: 6 });
            }
            // short distance & morning time & weekend ends

            // short distance & night time starts
            if (km < 3 && isMorning == true) {
                res.json({ totalPrice: 4 });
            }
            // short distance & night time ends


            const bookings = await Booking.findAll();
            return res.status(http_status_codes.StatusCodes.OK).json(bookings);
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching getAllBookings"
            });
        }
    },

    async findNearByDrivers(req, res, next) {
        try {
            driversArray = [];
            const {
                noOfSeating,
                vehicleType,
                currentLat,
                currentLng,
                searchInKM,
                paymentVia,
                passengerObj,
                origin,
                destination,
                estTime,
                totalKM,
                exactPriceForDriver,
                exactPriceForPassenger
            } = req.body;

            if (noOfSeating == 4 && vehicleType !== 'lite') {

                const drivers = await Driver.findAll(
                    {
                        where: {
                            [op.and]:
                                [
                                    { diverAvailablity: true },
                                    // { city: city } we are searching based on km not city
                                ]
                        },
                        include: [
                            {
                                model: Vehicle,
                                where: {
                                    [op.and]:
                                        [
                                            { vehicleType: vehicleType }
                                        ]
                                },
                            }
                        ]
                    }
                );

                if (drivers.length !== 0) {
                    var passengerCurrentLocation = {
                        lat: currentLat,
                        lon: currentLng
                    };

                    var objFromRequest = {
                        paymentVia: paymentVia,
                        passengerObj: passengerObj,
                        origin: origin,
                        destination: destination,
                        estTime: estTime,
                        totalKM: totalKM,
                        exactPriceForDriver: exactPriceForDriver,
                        exactPriceForPassenger: exactPriceForPassenger

                    }

                    await drivers.forEach(async driver => {
                        var isNearByDriverLocation = {
                            lat: driver.currentLat,
                            lon: driver.currentLng
                        };

                        var dist = geodist(passengerCurrentLocation, isNearByDriverLocation, {
                            format: true,
                            unit: 'meters'
                        });

                        var distinmeters = dist.substr(0, dist.indexOf(' '));

                        if (distinmeters < (searchInKM * 1000)) {
                            var obj = {

                                driverId: driver.id
                            }

                            driversArray.push(obj);
                        }
                    });
                    if (driversArray.length !== 0) {

                        return res.status(http_status_codes.StatusCodes.OK).json(
                            { driversIds: driversArray, objFromRequest: objFromRequest }
                        );

                    } else {
                        return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                            errors: 'Oooops! No Near By Driver is Found!'
                        });
                    }
                } else {
                    return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                        errors: 'No Driver Registered yet!'
                    });
                }

            } else if (noOfSeating == 5 && vehicleType !== 'lite') {

                const drivers = await Driver.findAll(
                    {
                        where: {
                            [op.and]:
                                [
                                    { diverAvailablity: true },
                                    // { city: city } we are searching based on km not city
                                ]
                        },
                        include: [
                            {
                                model: Vehicle,
                                where: {
                                    [op.and]:
                                        [
                                            { noOfSeating: { [op.or]: [5, 6] } },
                                            { vehicleType: vehicleType }
                                        ]
                                },
                            }
                        ]
                    }
                );

                if (drivers.length !== 0) {
                    var passengerCurrentLocation = {
                        lat: currentLat,
                        lon: currentLng
                    };

                    var objFromRequest = {
                        paymentVia: paymentVia,
                        passengerObj: passengerObj,
                        origin: origin,
                        destination: destination,
                        estTime: estTime,
                        totalKM: totalKM,
                        exactPriceForDriver: exactPriceForDriver,
                        exactPriceForPassenger: exactPriceForPassenger

                    }

                    await drivers.forEach(async driver => {
                        var isNearByDriverLocation = {
                            lat: driver.currentLat,
                            lon: driver.currentLng
                        };

                        var dist = geodist(passengerCurrentLocation, isNearByDriverLocation, {
                            format: true,
                            unit: 'meters'
                        });

                        var distinmeters = dist.substr(0, dist.indexOf(' '));

                        if (distinmeters < (searchInKM * 1000)) {
                            var obj = {

                                driverId: driver.id
                            }

                            driversArray.push(obj);
                        }
                    });
                    if (driversArray.length !== 0) {

                        return res.status(http_status_codes.StatusCodes.OK).json(
                            { driversIds: driversArray, objFromRequest: objFromRequest }
                        );

                    } else {
                        return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                            errors: 'Oooops! No Near By Driver is Found!'
                        });
                    }
                } else {
                    return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                        errors: 'No Driver Registered yet!'
                    });
                }

            } else if (noOfSeating == 6 && vehicleType !== 'lite') {

                const drivers = await Driver.findAll(
                    {
                        where: {
                            [op.and]:
                                [
                                    { diverAvailablity: true },
                                    // { city: city } we are searching based on km not city
                                ]
                        },
                        include: [
                            {
                                model: Vehicle,
                                where: {
                                    [op.and]:
                                        [
                                            { noOfSeating: 6 },
                                            { vehicleType: vehicleType }
                                        ]
                                },
                            }
                        ]
                    }
                );

                if (drivers.length !== 0) {
                    var passengerCurrentLocation = {
                        lat: currentLat,
                        lon: currentLng
                    };

                    var objFromRequest = {
                        paymentVia: paymentVia,
                        passengerObj: passengerObj,
                        origin: origin,
                        destination: destination,
                        estTime: estTime,
                        totalKM: totalKM,
                        exactPriceForDriver: exactPriceForDriver,
                        exactPriceForPassenger: exactPriceForPassenger
                    }

                    await drivers.forEach(async driver => {
                        var isNearByDriverLocation = {
                            lat: driver.currentLat,
                            lon: driver.currentLng
                        };

                        var dist = geodist(passengerCurrentLocation, isNearByDriverLocation, {
                            format: true,
                            unit: 'meters'
                        });

                        var distinmeters = dist.substr(0, dist.indexOf(' '));

                        if (distinmeters < (searchInKM * 1000)) {
                            var obj = {

                                driverId: driver.id
                            }

                            driversArray.push(obj);
                        }
                    });
                    if (driversArray.length !== 0) {

                        return res.status(http_status_codes.StatusCodes.OK).json(
                            { driversIds: driversArray, objFromRequest: objFromRequest }
                        );

                    } else {
                        return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                            errors: 'Oooops! No Near By Driver is Found!'
                        });
                    }
                } else {
                    return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                        errors: 'No Driver Registered yet!'
                    });
                }
            } else if (vehicleType === 'lite') {

                const drivers = await Driver.findAll(
                    {
                        where: {
                            [op.and]:
                                [
                                    { diverAvailablity: true },
                                    // { city: city } we are searching based on km not city
                                ]
                        },
                        include: [
                            {
                                model: Vehicle,
                                where: {
                                    [op.and]:
                                        [
                                            { vehicleType: vehicleType }
                                        ]
                                },
                            }
                        ]
                    }
                );

                if (drivers.length !== 0) {
                    var passengerCurrentLocation = {
                        lat: currentLat,
                        lon: currentLng
                    };

                    var objFromRequest = {
                        paymentVia: paymentVia,
                        passengerObj: passengerObj,
                        origin: origin,
                        destination: destination,
                        estTime: estTime,
                        totalKM: totalKM,
                        exactPriceForDriver: exactPriceForDriver,
                        exactPriceForPassenger: exactPriceForPassenger
                    }

                    await drivers.forEach(async driver => {
                        var isNearByDriverLocation = {
                            lat: driver.currentLat,
                            lon: driver.currentLng
                        };

                        var dist = geodist(passengerCurrentLocation, isNearByDriverLocation, {
                            format: true,
                            unit: 'meters'
                        });

                        var distinmeters = dist.substr(0, dist.indexOf(' '));

                        if (distinmeters < (searchInKM * 1000)) {
                            var obj = {

                                driverId: driver.id
                            }

                            driversArray.push(obj);
                        }
                    });
                    if (driversArray.length !== 0) {

                        return res.status(http_status_codes.StatusCodes.OK).json(
                            { driversIds: driversArray, objFromRequest: objFromRequest }
                        );

                    } else {
                        return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                            errors: 'Oooops! No Near By Driver is Found!'
                        });
                    }
                } else {
                    return res.status(http_status_codes.StatusCodes.NOT_FOUND).json({
                        errors: 'No Driver Registered yet!'
                    });
                }
            }

        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching findNearByDrivers"
            });
        }
    },
};