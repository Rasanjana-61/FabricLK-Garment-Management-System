const express = require('express');
const router = express.Router();
const {
  getTaxRecords,
  getTaxRecord,
  createTaxRecord,
  updateTaxRecord,
  deleteTaxRecord,
  makeTaxPayment,
  getTaxSummary
} = require('../controllers/taxComplianceController');
const { validateTaxRecord } = require('../middleware/validation');

// Protected at index.js with `protect`
router.post('/', validateTaxRecord, createTaxRecord);
router.put('/:id', validateTaxRecord, updateTaxRecord);
router.get('/', getTaxRecords);
router.get('/summary', getTaxSummary);
router.get('/:id', getTaxRecord);
router.delete('/:id', deleteTaxRecord);
router.post('/:id/payment', makeTaxPayment);

module.exports = router;