const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, userRegistrationSchema, userLoginSchema, partnerRegistrationSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// User routes
router.post('/register', validate(userRegistrationSchema), authController.registerUser);
router.post('/login', validate(userLoginSchema), authController.loginUser);

// Partner routes
router.post('/partner/register', validate(partnerRegistrationSchema), authController.registerPartner);
router.post('/partner/login', authController.loginPartner);

// Common routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/refresh', authController.refreshToken);

module.exports = router;
