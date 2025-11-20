const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authMiddleware, candidateMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/profile', candidateController.getProfile);
router.post('/credentials/add', candidateController.addCredential);
router.get('/skill-graph', candidateController.getSkillGraph);
router.post('/refresh-verification', candidateController.refreshVerification);
router.get('/qrcode', candidateController.generateQRCode);

module.exports = router;
