var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/check-auth');


router.post('/signup', adminController.createAdmin);
router.post('/signin', adminController.signinAdmin);

router.post('/update-password/:id', adminController.updatePassword);
router.post('/forgot-password', adminController.forgotPassword); // this api can be used for email verification as well but you must comment the purpose where u are using it, it is your resposibility



module.exports = router;