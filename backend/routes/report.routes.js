const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createReport,
  getAllReports,
  getMyReports,
  deleteReport,
} = require('../controllers/report.controller');
const { ISSUE_TYPES } = require('../config/constants');

router.use(authenticate);

router.post(
  '/',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('issueType').isIn(ISSUE_TYPES).withMessage(`Issue type must be one of: ${ISSUE_TYPES.join(', ')}`),
    body('description').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  createReport
);

router.get('/', getAllReports);
router.get('/mine', getMyReports);
router.delete('/:id', deleteReport);

module.exports = router;
