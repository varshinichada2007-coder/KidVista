const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/me', authenticate, authController.getMe);
router.post('/reset-admin-password', authController.resetAdminPassword);

module.exports = router;