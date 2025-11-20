const Credential = require('../models/Credential');
const CandidateSkillGraph = require('../models/CandidateSkillGraph');
const Issuer = require('../models/Issuer');
const onestService = require('../services/onestService');
const skillMappingService = require('../services/skillMappingService');
const qrcodeService = require('../services/qrcodeService');
const { addToQueue, updateSkillGraphJob } = require('../services/backgroundJobs');
const { v4: uuidv4 } = require('uuid');

exports.getProfile = async (req, res) => {
  try {
    const skillGraph = await CandidateSkillGraph.findOne({ 
      candidateId: req.userId 
    }).populate('skills.skill');

    const credentials = await Credential.find({ 
      candidateId: req.userId 
    }).sort({ createdAt: -1 });

    res.json({
      skillGraph: skillGraph || { skills: [], overallScore: 0 },
      credentials,
      credentialCount: credentials.length,
      verifiedCount: credentials.filter(c => c.verificationStatus === 'verified').length
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.addCredential = async (req, res) => {
  try {
    const { credentialReferenceId, issuerType } = req.body;

    let issuer = await Issuer.findOne({ type: issuerType || 'onest' });
    if (!issuer) {
      issuer = await Issuer.create({
        name: issuerType === 'onest' ? 'ONEST Network' : 'Mock Issuer',
        type: issuerType || 'onest',
        isActive: true,
        trustScore: 85
      });
    }

    const credentialData = await onestService.fetchCredentialFromONEST(credentialReferenceId);
    
    const validation = await onestService.validateCredential(credentialData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Credential validation failed', 
        reason: validation.reason 
      });
    }

    const normalized = onestService.normalizeCredentialData(credentialData);

    const credential = await Credential.create({
      candidateId: req.userId,
      credentialId: credentialReferenceId,
      issuer: issuer._id,
      issuerName: normalized.issuerName,
      type: normalized.type,
      title: normalized.title,
      description: normalized.description,
      skills: normalized.skills,
      issuedDate: normalized.issuedDate,
      expiryDate: normalized.expiryDate,
      verificationStatus: 'verified',
      signature: credentialData.signature,
      verificationUrl: credentialData.verificationUrl,
      rawData: normalized.rawData
    });

    addToQueue({
      type: 'update_skill_graph',
      data: req.userId,
      handler: updateSkillGraphJob
    });

    res.status(201).json({
      message: 'Credential added successfully',
      credential
    });
  } catch (error) {
    console.error('Add credential error:', error);
    res.status(500).json({ error: error.message || 'Failed to add credential' });
  }
};

exports.getSkillGraph = async (req, res) => {
  try {
    const skillGraph = await CandidateSkillGraph.findOne({ 
      candidateId: req.userId 
    }).populate('skills.skill');

    if (!skillGraph) {
      return res.json({
        skills: [],
        overallScore: 0,
        strengthAreas: [],
        skillCount: 0
      });
    }

    res.json(skillGraph);
  } catch (error) {
    console.error('Get skill graph error:', error);
    res.status(500).json({ error: 'Failed to fetch skill graph' });
  }
};

exports.refreshVerification = async (req, res) => {
  try {
    const skillGraph = await skillMappingService.updateCandidateSkillGraph(req.userId);
    await skillMappingService.deduplicateSkills(req.userId);

    res.json({
      message: 'Verification refreshed successfully',
      skillGraph
    });
  } catch (error) {
    console.error('Refresh verification error:', error);
    res.status(500).json({ error: 'Failed to refresh verification' });
  }
};

exports.generateQRCode = async (req, res) => {
  try {
    const qrCodeData = await qrcodeService.generateQRCode(req.userId);

    res.json({
      message: 'QR code generated successfully',
      ...qrCodeData
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};
