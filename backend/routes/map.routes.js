const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { geocodeSearch, getRoute, getSafePlaces } = require('../controllers/map.controller');

router.use(authenticate);

router.get('/geocode', geocodeSearch);
router.get('/route', getRoute);
router.get('/safe-places', getSafePlaces);

module.exports = router;
