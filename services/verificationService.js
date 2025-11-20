const CandidateSkillGraph = require('../models/CandidateSkillGraph');
const User = require('../models/User');
const VerificationLog = require('../models/VerificationLog');
const { generateVerifiablePresentation } = require('../utils/signature');
const { v4: uuidv4 } = require('uuid');

class VerificationService {
  async verifyCandidate(candidateId) {
    const workflowId = uuidv4();
    
    const verificationLog = await VerificationLog.create({
      workflowId,
      candidateId,
      type: 'verification_request',
      status: 'in_progress',
      steps: [{
        stepName: 'Initiate verification',
        status: 'completed',
        timestamp: new Date(),
        details: { candidateId }
      }]
    });

    try {
      const candidate = await User.findById(candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }

      verificationLog.steps.push({
        stepName: 'Fetch candidate data',
        status: 'completed',
        timestamp: new Date(),
        details: { candidateName: candidate.name }
      });

      const skillGraph = await CandidateSkillGraph.findOne({ candidateId })
        .populate('skills.skill');

      if (!skillGraph) {
        throw new Error('Skill graph not found');
      }

      verificationLog.steps.push({
        stepName: 'Retrieve skill graph',
        status: 'completed',
        timestamp: new Date(),
        details: { skillCount: skillGraph.skills.length }
      });

      const verifiablePresentation = generateVerifiablePresentation(candidate, skillGraph.skills);

      verificationLog.steps.push({
        stepName: 'Generate verifiable presentation',
        status: 'completed',
        timestamp: new Date(),
        details: { vpType: verifiablePresentation.type }
      });

      const result = {
        candidateId: candidate._id,
        candidateName: candidate.name,
        verificationStatus: 'verified',
        timestamp: new Date(),
        skillCount: skillGraph.skills.length,
        overallScore: skillGraph.overallScore,
        skills: skillGraph.skills.map(s => ({
          name: s.skillName,
          nsqfLevel: s.nsqfLevel,
          proficiency: s.proficiency,
          recencyScore: s.recencyScore,
          sources: s.sources.map(src => ({
            issuer: src.issuerName,
            verifiedDate: src.verifiedDate
          }))
        })),
        verifiablePresentation
      };

      verificationLog.status = 'completed';
      verificationLog.completedAt = new Date();
      verificationLog.duration = verificationLog.completedAt - verificationLog.startedAt;
      verificationLog.outputData = result;
      await verificationLog.save();

      return result;
    } catch (error) {
      verificationLog.status = 'failed';
      verificationLog.errorMessage = error.message;
      verificationLog.completedAt = new Date();
      await verificationLog.save();
      throw error;
    }
  }

  async verifyByQR(qrData) {
    try {
      const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString());
      const { candidateId, timestamp } = decoded;

      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - new Date(timestamp).getTime() > maxAge) {
        return {
          valid: false,
          reason: 'QR code expired',
          maxAge: '24 hours'
        };
      }

      const verification = await this.verifyCandidate(candidateId);

      return {
        valid: true,
        ...verification
      };
    } catch (error) {
      return {
        valid: false,
        reason: error.message
      };
    }
  }

  async checkRevocationStatus(credentialId) {
    return {
      credentialId,
      isRevoked: false,
      lastChecked: new Date(),
      status: 'active'
    };
  }
}

module.exports = new VerificationService();
