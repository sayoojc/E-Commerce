const express = require('express');
const router = express.Router();

const salesReportController = require('../../controllers/admin/salesReportCntrl');
const adminAuth = require('../../Middleware/adminAuth');
const serverError = require('../../Middleware/errorHandler');

router.get('/getSalesReport',adminAuth.adminAuth,salesReportController.getSalesReport);
router.get('/downloadPdf/:start/:end',adminAuth.adminAuth, salesReportController.getSalesReportPdf);
router.get('/downloadExcel/:start/:end',adminAuth.adminAuth, salesReportController.generateExcel);

module.exports = router;