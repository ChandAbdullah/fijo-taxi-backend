const http_status_codes = require('http-status-codes');
const hashedpassword = require("password-hash");
const sequelize = require("sequelize");
const op = sequelize.Op;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const {
    Driver
} = require('../database/database');
const driver = require('../models/driver');
module.exports = {

    async createDriver(req, res, next) {

        try {


            const {
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                driverPhoto,
                gender,
                address,
                postalCode,
                city,
                currentLat,
                currentLng
            } = req.body;

            Driver.findOne({
                where: {
                    email: email
                }
            }).then(isDriverExist => {
                if (isDriverExist) {
                    res.json({ error: "This Driver already exists" });
                } else {

                    Driver.create({
                        firstName: firstName,
                        lastName: lastName,
                        password: hashedpassword.generate(password),
                        email: email,
                        phoneNumber: phoneNumber,
                        driverPhoto: driverPhoto,
                        address: address,
                        postalCode: postalCode,
                        city: city,
                        gender: gender,
                        nie_Dnle: null,
                        nie_Dnle_FrontPic: null,
                        nie_Dnle_BackPic: null,
                        nationality: null,
                        accountNumber: null,
                        isApproved: false,
                        currentLat: currentLat,
                        currentLng: currentLng
                    })
                        .then((driver) => {
                            return res.status(http_status_codes.StatusCodes.CREATED).json({ message: 'Driver is Created Successfully', driverId: driver.id, driverObj: driver });
                        });
                }
            });
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: "Error Occurd in Creating Driver"
            });
        }
    },

    signinDriver(req, res, next) {

        try {
            const {
                email,
                password,
            } = req.body;

            Driver.findOne({
                where: {
                    email: req.body.email
                },
            }).then(isDriverExist => {
                if (isDriverExist) {
                    if (isDriverExist.isLogedIn == true) {
                        res.json({
                            message: "You are already login from another device. Please logput first to login from this device",

                        })
                    } else {
                        const verify_password = hashedpassword.verify(
                            req.body.password, isDriverExist.password
                        );
                        if (verify_password) {
                            if (isDriverExist.isApproved == true) {
                                const token = jwt.sign({
                                    email: req.body.email,
                                    driverId: isDriverExist.id
                                },
                                    "very-long-string-for-secret", {
                                    expiresIn: 3600
                                }
                                );

                                Driver.update({
                                    isLogedIn: true
                                }, {
                                    where: {
                                        id: isDriverExist.id
                                    }
                                })

                                res.json({
                                    message: "successfully login",
                                    accessToken: token,
                                    driver: isDriverExist,
                                    expiresIn: '3600'
                                })

                            } else if (isDriverExist.isApproved == false) {
                                res.status(http_status_codes.StatusCodes.UNAUTHORIZED).json({
                                    error: 'Sorry, you are not approved by Admin yet.'
                                });
                            }
                        } else {
                            res.status(http_status_codes.StatusCodes.UNAUTHORIZED).json({
                                error: 'invalidcredentials'
                            })
                        }
                    }

                } else {
                    res.status(http_status_codes.StatusCodes.UNAUTHORIZED).json({
                        error: 'driver does not exist'
                    })
                }
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: 'error in signinDriver'
            });
        }
    },

    async resetPassword(req, res, next) {
        try {
            const driverId = req.params.id;
            const oldpassword = req.body.oldpassword;
            const newpassword = req.body.newpassword;
            Driver.findOne({
                where: { id: driverId }
            })
                .then((isDriver) => {
                    const isAuth = hashedpassword.verify(
                        oldpassword,
                        isDriver.password
                    );
                    if (isAuth) {

                        isDriver.update({
                            password: hashedpassword.generate(newpassword)
                        })
                            .then(() => {
                                res.json({ message: 'Password updated successfully' });
                            })
                    } else if (!isAuth) {
                        res.json({ message: 'Oops Password not updated' });
                    }
                })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All Approved"
            });
        }
    },


    async findDriverByEmail(req, res, next) {
        try {
            const {
                email
            } = req.body;

            const driver = await Driver.findOne({
                where: { email: email }
            });
            if (driver) {
                return res.status(http_status_codes.StatusCodes.OK).json({ driver: driver, isDriverExist: true });
            } else {
                return res.status(http_status_codes.StatusCodes.OK).json({ driver: null, isDriverExist: false });
            }
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in finding findDriverByEmail"
            });
        }
    },

    async findDriverByPhoneNumber(req, res, next) {
        try {
            const {
                phoneNumber
            } = req.body;

            const driver = await Driver.findOne({
                where: { phoneNumber: phoneNumber }
            });
            if (driver) {
                return res.status(http_status_codes.StatusCodes.OK).json({ driver: driver, isDriverExist: true });
            } else {
                return res.status(http_status_codes.StatusCodes.OK).json({ driver: null, isDriverExist: false });
            }
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in finding findDriverByphoneNumber"
            });
        }
    },

    async getallAvailableDrivers(req, res, next) {
        try {

            const driver = await Driver.findAll({
                where: {
                    [op.and]: [{
                        diverAvailablity: true
                    },
                    {
                        isApproved: true
                    }
                    ]
                },
                attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'currentLat',
                    'currentLng',
                    'email',
                ]
            });
            if (driver) {
                return res.status(http_status_codes.StatusCodes.OK).json({
                    driver: driver,
                    isDriverExist: true
                });
            } else {
                return res.status(http_status_codes.StatusCodes.OK).json({
                    driver: null,
                    isDriverExist: false
                });
            }
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in finding find Available Drivers"
            });
        }
    },


    async isDriverLogin(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId } });
            return res.status(http_status_codes.StatusCodes.OK).json({ isDriverLogin: driver.isLogedIn });

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async deleteDriver(req, res, next) {
        try {
            driverId = req.params.driverId;
            const driver = await Driver.destroy({ where: { id: driverId } });
            return res.status(http_status_codes.StatusCodes.OK).json({ message: 'Driver Deleted Successfully' });
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Deleting Driver"
            });
        }
    },


    async approveDriver(req, res, next) {
        try {
            driverId = req.params.driverId;

            Driver.update({
                isApproved: true
            }, {
                where: {
                    id: driverId
                }
            })
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: "Approved sussessfully",
                approvalStatus: true
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in approveDriver"
            })
        }
    },

    async disApproveDriver(req, res, next) {
        try {
            driverId = req.params.driverId;

            Driver.update({
                isApproved: false
            }, {
                where: {
                    id: driverId
                }
            })
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: "Disapproved sussessfully",
                approvalStatus: false
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in disApproveDriver"
            })
        }
    },

    async updateDriver(req, res, next) {
        try {
            driverId = req.params.driverId;
            const {
                firstName,
                lastName,
                phoneNumber,
                driverPhoto,
                gender,
                address,
                postalCode,
                city,
                nie_Dnle,
                nie_Dnle_FrontPic,
                nie_Dnle_BackPic,
                nationality,
                accountNumber,

            } = req.body
            Driver.update({
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                driverPhoto: driverPhoto,
                gender: gender,
                address: address,
                postalCode: postalCode,
                city: city,
                gender: gender,
                nie_Dnle: nie_Dnle,
                nie_Dnle_FrontPic: nie_Dnle_FrontPic,
                nie_Dnle_BackPic: nie_Dnle_BackPic,
                nationality: nationality,
                accountNumber: accountNumber
            }, {
                where: {
                    id: driverId
                }
            }).then(findDriver => {
                Driver.findByPk(driverId).then(resp => {
                    return res.status(http_status_codes.StatusCodes.OK).json({
                        message: "Updated sussessfully",
                        driverObj: resp
                    })
                })
            })

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in updateDriver"
            })
        }
    },

    async logoutDriver(req, res, next) {
        try {
            driverId = req.params.driverId;

            Driver.update({
                isLogedIn: false
            }, {
                where: {
                    id: driverId
                }
            }).then(a => {
                return res.status(http_status_codes.StatusCodes.OK).json({
                    message: "Logedout sussessfully"
                })
            })

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in logoutDriver"
            })
        }
    },

    async isLogedInTrue(req, res, next) {
        try {
            driverId = req.params.driverId;

            Driver.update({
                isLogedIn: true
            }, {
                where: {
                    id: driverId
                }
            }).then(a => {
                return res.status(http_status_codes.StatusCodes.OK).json({
                    message: "is Logged In sussessfully"
                })
            })

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in isLogedInTrue Driver"
            })
        }
    },

    async changeDriverAvailabiliyStatus(req, res, next) {
        try {
            driverId = req.params.driverId;
            const {
                isAvailable
            } = req.body
            Driver.update({
                diverAvailablity: isAvailable
            }, {
                where: {
                    id: driverId
                }
            })
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: "Updated sussessfully"
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in changeDriverAvailabiliyStatus"
            })
        }
    },

    async createDriverBankDetails(req, res, next) {
        try {
            driverId = req.params.driverId;
            const {
                nie_Dnle,
                nie_Dnle_FrontPic,
                nie_Dnle_BackPic,
                nationality,
                accountNumber

            } = req.body
            Driver.update({

                nie_Dnle: nie_Dnle,
                nie_Dnle_FrontPic: nie_Dnle_FrontPic,
                nie_Dnle_BackPic: nie_Dnle_BackPic,
                nationality: nationality,
                accountNumber: accountNumber
            }, {
                where: {
                    id: driverId
                }
            })
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: "Updated sussessfully"
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in createDriverBankDetails"
            })
        }
    },

    async updateCurrentLocation(req, res, next) {
        try {
            driverId = req.params.driverId;
            const {
                currentLat,
                currentLng,
                city,
                address,
                postalCode,

            } = req.body
            Driver.update({
                currentLat: currentLat,
                currentLng: currentLng,
                city: city,
                address: address,
                postalCode: postalCode,
            }, {
                where: {
                    id: driverId
                }
            })
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: "Updated sussessfully"
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured in updateCurrentLocation"
            })
        }
    },

    async getAvailabilityStatus(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId } });
            if (driver) {
                return res.status(http_status_codes.StatusCodes.OK).json({ isDriverAvailable: driver.diverAvailablity });
            } else {
                return res.status(http_status_codes.StatusCodes.OK).json({ message: 'Driver Not Found' });
            }
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single getAvailabilityStatus"
            })
        }
    },

    async getbyId(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId } });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async getPhotoById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'driverPhoto'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },
    async getBalanceById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'balance', 'viacard', 'viacash'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async getViaCashBalanceById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'viacash'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },
    async getViaCardBalanceById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'viacard'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async getRatingById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'rating'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async getRatingBalanceById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'rating', 'balance'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async getIsRequestedStatusById(req, res, next) {
        try {
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'isWithdrawRequested'] });
            return res.status(http_status_codes.StatusCodes.OK).json(driver);

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error occured in fetching single driver"
            })
        }
    },

    async getAll(req, res, next) {
        try {
            const drivers = await Driver.findAll();
            return res.status(http_status_codes.StatusCodes.OK).json(drivers);
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All drivers"
            });
        }
    },

    async rateDriver(req, res, next) {

        try {
            driverId = req.params.driverId;
            const driver = await Driver.findOne({ where: { id: req.params.driverId }, attributes: ['id', 'rating', 'rating_no'] });
            const {
                rating
            } = req.body;

            if (driver.rating_no === 0) {

                Driver.update({
                    rating: rating,
                    rating_no: 1
                }, {
                    where: {
                        id: driverId
                    }
                });
                return res.status(http_status_codes.StatusCodes.OK).json({
                    message: "Rated Successfully"
                })

            } else if (driver.rating_no === 1) {

                Driver.update({
                    rating_no: (driver.rating_no + 1),
                    rating: (driver.rating + rating) / 2
                }, {
                    where: {
                        id: driverId
                    }
                });
                return res.status(http_status_codes.StatusCodes.OK).json({
                    message: "Rated Successfully"
                })

            } else if (driver.rating_no > 1) {

                Driver.update({
                    rating_no: driver.rating_no + 1,
                    rating: ((driver.rating * driver.rating_no) + rating) / (driver.rating_no + 1)
                }, {
                    where: {
                        id: driverId
                    }
                });
                return res.status(http_status_codes.StatusCodes.OK).json({
                    message: "Rated Successfully"
                })
            }

        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "an error occured"
            })
        }
    },

    async updatePassword(req, res, next) {
        try {
            id = req.params.id;
            const {
                password
            } = req.body

            Driver.update({
                password: hashedpassword.generate(password)
            }, {
                where: {
                    id: id
                }
            })
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: "Updated sussessfully"
            })
        } catch (error) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "An error updatePassword"
            })
        }
    },

    async forgotPassword(req, res, next) {
        const reqData = req.body;
        Driver.findOne({
            where: { email: reqData.email }
        }).then(isDriver => {
            if (isDriver) {
                // send email
                var drivermail = req.body.email;
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'fijotaxi@gmail.com',
                        pass: 'fijotaxi2020'
                    }
                });
                var rand = Math.floor(100000 + Math.random() * 900000);
                var mailOptions = {
                    from: ' ', // sender address
                    to: drivermail, // list of receivers
                    subject: 'Driver Password Verification Code', // Subject line
                    text: 'Here is a code to setup your password again', // plain text body
                    html: 'Hi Dear Driver <br>Please verify your email using the link below and get back your password! <b style="font-size:24px;margin-left:30px"> Your code - ' + rand + '<b>' // html body

                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.json('error occured')
                    } else {
                        res.json({
                            driver: isDriver,
                            verificationCode: rand
                        });
                    }
                });

            } else {
                res.json({ message: "Email does not exit" });
            }
        }).catch(err => {
            console.log(err);
            res.json("Some Error Occured!");
        });
    },

};