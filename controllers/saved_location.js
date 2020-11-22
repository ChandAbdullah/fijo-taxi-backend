const http_status_codes = require('http-status-codes');
const {
   
    SavedLocation
} = require('../database/database');
module.exports = {

    async createSavedLocation(req, res, next) {
        try {
            const {
                routePath,
                routeTitle,
                passengerId
            } = req.body;           
            const savedLocation = await SavedLocation.create({
                routePath: routePath,
                routeTitle: routeTitle,
                passengerId: passengerId
            });
            return res.status(http_status_codes.CREATED).json(savedLocation);
        } catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Creating SavedLocation"
            });
        }
    },

    async updateSavedLocation(req, res, next) {
        try {
            const {
                routePath,
                routeTitle,
                passengerId
            } = req.body;
            savedLocationId = req.params.id;
            const savedLocation = await SavedLocation.update({
                routePath: routePath,
                routeTitle: routeTitle,
                passengerId: passengerId
                
            }, {
                where: {
                    id: savedLocationId
                }
            });
            return res.status(http_status_codes.OK).json({
                message: 'SavedLocation Updated Successfully'
            });
        } 
        catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Updating SavedLocation"
            });
        }
    },

    async getSavedLocation(req, res, next) {
        try {
            savedLocationId = req.params.id;
            const savedLocation = await SavedLocation.findOne({where: {id: savedLocationId }});
            return res.status(http_status_codes.OK).json(savedLocation);
        } 
        catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching SavedLocation"
            });
        }
    },

    async getAllSavedLocations(req, res, next) {
        try {            
            const savedLocations = await SavedLocation.findAll();
            return res.status(http_status_codes.OK).json(savedLocations);
        } 
        catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Fetching All SavedLocation"
            });
        }
    },


    async deleteSavedLocation(req, res, next) {
        try {    
            savedLocationId = req.params.id;        
            const savedLocation = await SavedLocation.destroy({where: {id: savedLocationId}});
            return res.status(http_status_codes.OK).json({message: 'SavedLocation Deleted Successfully'});
        } 
        catch (err) {
            return res.status(http_status_codes.INTERNAL_SERVER_ERROR).json({
                message: "Error Occurd in Deleting SavedLocation"
            });
        }
    }
};