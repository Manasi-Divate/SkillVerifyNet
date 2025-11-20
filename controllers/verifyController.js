const verificationService = require('../services/verificationService');
const User = require('../models/User');

exports.verifyById = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const verification = await verificationService.verifyCandidate(candidateId);

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('Verify by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.verifyByQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    const verification = await verificationService.verifyByQR(qrData);

    res.json({
      success: verification.valid,
      verification
    });
  } catch (error) {
    console.error('Verify by QR error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.checkRevocationStatus = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const status = await verificationService.checkRevocationStatus(credentialId);

    res.json(status);
  } catch (error) {
    console.error('Check revocation status error:', error);
    res.status(500).json({ error: error.message });
  }
};
