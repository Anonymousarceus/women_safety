const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateEmergencyContacts, updateProfile } = require('../controllers/user.controller');

router.use(authenticate);

router.put(
  '/emergency-contacts',
  [
    body('emergencyContacts').isArray().withMessage('Emergency contacts must be an array'),
    body('emergencyContacts.*.name').trim().notEmpty().withMessage('Contact name is required'),
    body('emergencyContacts.*.phone').trim().notEmpty().withMessage('Contact phone is required'),
  ],
  validate,
  updateEmergencyContacts
);

router.patch('/profile', updateProfile);

module.exports = router;
