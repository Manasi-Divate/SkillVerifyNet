const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');

router.get('/by-id/:candidateId', verifyController.verifyById);
router.post('/by-qr', verifyController.verifyByQR);
router.get('/revocation/:credentialId', verifyController.checkRevocationStatus);

module.exports = router;
