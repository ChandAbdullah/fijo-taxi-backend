const http_status_codes = require('http-status-codes');
const hashedpassword = require("password-hash");
const sequelize = require("sequelize");
const op = sequelize.Op;
const jwt = require("jsonwebtoken");

const {
    Passenger
} = require('../database/database');
module.exports = {

    async createPassenger(req, res, next) {

        try {
            const {

                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                gender,
                profilePhoto,
                address,
                postalCode,
                city
            } = req.body;

            Passenger.findOne({
                where: {
                    email: email
                }
            }).then(isPassengerExist => {
                if (isPassengerExist) {
                    res.json({ error: "This Passenger already exists" });
                } else {

                    Passenger.create({
                        firstName: firstName,
                        lastName: lastName,
                        password: hashedpassword.generate(password),
                        email: email,
                        phoneNumber: phoneNumber,
                        gender: gender,
                        profilePhoto: profilePhoto,
                        address: address,
                        postalCode: postalCode,
                        city: city
                    });

                    return res.status(http_status_codes.CREATED).json({ error: 'Passenger is Created Successfully' });

                }
            });
        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                error: "Error Occurd in Creating createPassenger"
            });
        }
    },

    signinPassenger(req, res, next) {

        try {
            const {
                email,
                password,
            } = req.body;

            Passenger.findOne({
                where: {
                    email: req.body.email
                },
            }).then(isPassengerExist => {
                if (isPassengerExist) {
                    const verify_password = hashedpassword.verify(
                        req.body.password, isPassengerExist.password
                    );
                    if (verify_password) {
                        const token = jwt.sign({
                            email: req.body.email,
                            pessengerId: isPassengerExist.id
                        },
                            "very-long-string-for-secret", {
                            expiresIn: 3600
                        }
                        );

                        res.json({
                            message: "successfully login",
                            accessToken: token,
                            pessenger: isPassengerExist,
                            expiresIn: '3600'
                        })
                    } else {
                        res.status(http_status_codes.UNAUTHORIZED).json({
                            error: 'invalidcredentials'
                        })
                    }
                } else {
                    res.status(http_status_codes.UNAUTHORIZED).json({
                        error: 'invalidcredentials'
                    })
                }
            })
        } catch (error) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                error: 'error in signinPassenger'
            });
        }
    },

    async updatePassenger(req, res, next) {
        try {
            passengerId = req.params.passengerId;
            const {
                firstName,
                lastName,
                phoneNumber,
                gender,
                profilePhoto,
                address,
                postalCode,
                city,
            } = req.body
            Passenger.update({
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                gender: gender,
                profilePhoto: profilePhoto,
                address: address,
                postalCode: postalCode,
                city: city
            }, {
                where: {
                    id: passengerId
                }
            })
            return res.status(http_status_codes.OK).json({
                message: "Updated sussessfully"
            })
        } catch (error) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in updatePassenger"
            })
        }
    },

    async getbyId(req, res, next) {
        try {
            const passenger = await Passenger.findOne({ where: { id: req.params.passengerId } });
            return res.status(http_status_codes.OK).json(passenger);

        } catch (error) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single passenger"
            })
        }
    },

    async getAll(req, res, next) {
        try {
            const passengers = await Passenger.findAll();
            return res.status(http_status_codes.OK).json(passengers);
        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All Passengers"
            });
        }
    },

};