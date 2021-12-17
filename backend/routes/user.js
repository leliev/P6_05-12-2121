const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const limiter = require('../middleware/limiter')

router.post('/signup', userCtrl.signup);
router.post('/login', limiter.loginlimiter, userCtrl.login);

module.exports = router;