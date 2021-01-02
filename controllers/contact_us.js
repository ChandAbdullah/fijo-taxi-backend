const http_status_codes = require('http-status-codes');
const {

    ContactUs, Passenger, Driver
} = require('../database/database');
module.exports = {

    async createContactUs(req, res, next) {
        try {
            const {
                passengerId,
                driverId,
                subject,
                message,
            } = req.body;

            const contactUs = await ContactUs.create({
                passengerId: passengerId,
                driverId: driverId,
                subject: subject,
                message: message
            });
            return res.status(http_status_codes.StatusCodes.CREATED).json(contactUs);
        } catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Creating ContactUs"
            });
        }
    },

    async updateContactUs(req, res, next) {
        try {
            const {
                passengerId,
                driverId,
                subject,
                message
            } = req.body;

            contactUsId = req.params.id;
            const contactUs = await ContactUs.update({
                driverId: driverId,
                passengerId: passengerId,
                subject: subject,
                message: message

            }, {
                where: {
                    id: contactUsId
                }
            });
            return res.status(http_status_codes.StatusCodes.OK).json({
                message: 'ContactUs Updated Successfully'
            });
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Updating ContactUs"
            });
        }
    },

    async getContactUs(req, res, next) {
        try {
            contactUsId = req.params.id;
            const contactUs = await ContactUs.findOne({ where: { id: contactUsId } });
            return res.status(http_status_codes.StatusCodes.OK).json(contactUs);
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching ContactUs"
            });
        }
    },

    async getContactUsByPassenger(req, res, next) {
        try {
            passengerId = req.params.passengerId;
            const contactUs = await ContactUs.findOne({ where: { passengerId: passengerId } });
            return res.status(http_status_codes.StatusCodes.OK).json(contactUs);
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching ContactUs"
            });
        }
    },


    async getContactUsByDriver(req, res, next) {
        try {
            driverId = req.params.driverId;
            const contactUs = await ContactUs.findOne({ where: { driverId: driverId } });
            return res.status(http_status_codes.StatusCodes.OK).json(contactUs);
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching ContactUs"
            });
        }
    },

    async getAllContactUss(req, res, next) {
        try {
            const contactUss = await ContactUs.findAll();
            return res.status(http_status_codes.StatusCodes.OK).json(contactUss);
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All ContactUs"
            });
        }
    },

    async getAllContactUssByPassenger(req, res, next) {
        try {
            const contactUss = await ContactUs.findAll({ where: { driverId: null }, include: { model: Passenger, attributes: ['email', 'firstName', 'lastName'] } });
            return res.status(http_status_codes.StatusCodes.OK).json(contactUss);
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All ContactUs"
            });
        }
    },

    async getAllContactUssByDriver(req, res, next) {
        try {
            const contactUss = await ContactUs.findAll({ where: { passengerId: null }, include: { model: Driver, attributes: ['email', 'firstName', 'lastName'] } });
            return res.status(http_status_codes.StatusCodes.OK).json(contactUss);
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All ContactUs"
            });
        }
    },


    async deleteContactUs(req, res, next) {
        try {
            contactUsId = req.params.id;
            const contactUs = await ContactUs.destroy({ where: { id: contactUsId } });
            return res.status(http_status_codes.StatusCodes.OK).json({ message: 'ContactUs Deleted Successfully' });
        }
        catch (err) {
            return res.status(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Deleting ContactUs"
            });
        }
    }
};