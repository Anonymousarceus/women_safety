const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  startJourney,
  updateLocation,
  endJourney,
  getActiveJourney,
  getJourneyById,
  getJourneyHistory,
  calculateSafeRoute,
} = require('../controllers/journey.controller');

router.use(authenticate);

router.post(
  '/start',
  [
    body('startLocation.latitude').isFloat().withMessage('Valid start latitude required'),
    body('startLocation.longitude').isFloat().withMessage('Valid start longitude required'),
    body('destination.latitude').isFloat().withMessage('Valid destination latitude required'),
    body('destination.longitude').isFloat().withMessage('Valid destination longitude required'),
    body('expectedTime').isISO8601().withMessage('Valid expected time required'),
  ],
  validate,
  startJourney
);

router.post(
  '/update-location',
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
  ],
  validate,
  updateLocation
);

router.post('/end', endJourney);
router.get('/active', getActiveJourney);
router.get('/history', getJourneyHistory);
router.get('/:id', getJourneyById);
router.post('/safe-route', calculateSafeRoute);

module.exports = router;
