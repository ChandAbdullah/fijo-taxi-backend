var express = require('express');
var router = express.Router();
const savedLocationController = require('../controllers/saved_location');


router.post('/create', savedLocationController.createSavedLocation );
router.post('/update/:id', savedLocationController.updateSavedLocation );
router.post('/delete/:id', savedLocationController.deleteSavedLocation );
router.get('/get/:id', savedLocationController.getSavedLocation );
router.get('/getall', savedLocationController.getAllSavedLocations );



module.exports = router;