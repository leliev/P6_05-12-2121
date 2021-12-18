const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const limiter = require('../middleware/limiter');
const validator = require('../middleware/datavalidator');

router.post('/signup', validator, userCtrl.signup);
router.post('/login', limiter.loginlimiter, userCtrl.login);

module.exports = router;