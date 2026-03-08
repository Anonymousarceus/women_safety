const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { triggerSOS, resolveSOS, getSOSHistory } = require('../controllers/sos.controller');

router.use(authenticate);

router.post(
  '/trigger',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  ],
  validate,
  triggerSOS
);

router.patch('/:id/resolve', resolveSOS);
router.get('/history', getSOSHistory);

module.exports = router;
