# Beckn-Based Skill Verification Network

A production-ready skill verification network using Beckn Protocol, ONEST integration, and NSQF competency mapping for automated skill verification and standardized candidate profiles.

## 🎯 Overview

This platform solves the problem of fragmented and unreliable skill verification in hiring by:
- Connecting with ONEST for educational credentials
- Aggregating skills from multiple issuers and assessment platforms
- Mapping skills to NSQF (National Skills Qualification Framework) levels
- Providing instant verification via API or QR codes
- Generating cryptographically signed verifiable presentations

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Pure HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Protocols**: Beckn Protocol v1.1.0, ONEST/DSEP
- **Standards**: NSQF, W3C Verifiable Credentials, OpenID4VP

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (HTML/CSS/JS)                 │
│  Landing │ Auth │ Dashboard │ Profile │ Admin │ Verify │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Backend API (Express)                    │
│  Auth │ Candidate │ Beckn │ Verification │ Admin       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                    Services Layer                        │
│  ONEST │ Skill Mapping │ Verification │ QR │ Beckn    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  MongoDB Database                        │
│  Users │ Credentials │ Skills │ Logs │ Transactions    │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Beckn Protocol Flow

The system implements the complete Beckn transaction lifecycle:

### Discovery Phase
```
Candidate → search (intent: skill issuer) → Gateway
Gateway → broadcast → Skill Issuers (BPPs)
Issuers → on_search (catalog) → Gateway → Candidate
```

### Selection & Confirmation
```
Candidate → select (issuer + service) → Issuer
Issuer → on_select (quote) → Candidate
Candidate → confirm (order) → Issuer
Issuer → on_confirm (verified order) → Candidate
```

### Post-Fulfillment
```
Candidate → status (order_id) → Issuer
Issuer → on_status (completion status) → Candidate
```

## 📚 ONEST Integration

### Credential Fetching Workflow
1. **Request**: Candidate provides credential reference ID
2. **Fetch**: System calls ONEST API (or mock endpoint)
3. **Validate**: Verify signature, expiry, and authenticity
4. **Normalize**: Convert to unified credential format
5. **Store**: Save to MongoDB with verification status

### Mock Credentials (for Demo)
- `ONEST001`: B.Tech Computer Science (IIT)
- `ONEST002`: AWS Solutions Architect Certification
- `ONEST003`: Full Stack Development Assessment

## 🎓 NSQF Competency Mapping

Skills are mapped to 8 NSQF levels based on complexity:

| Level | Description | Example Skills |
|-------|-------------|----------------|
| 1-2   | Entry/Basic | Helper, Assistant roles |
| 3-4   | Intermediate/Advanced | Junior Developer, Technician |
| 5-6   | Specialist/Professional | Senior Developer, Manager |
| 7-8   | Expert/Research | Architect, Research Scientist |

### Skill Mapping Process
1. Extract raw skills from credentials
2. Normalize skill names (taxonomy mapping)
3. Calculate NSQF level based on:
   - Credential type (education, certification, assessment)
   - Experience level
   - Skill complexity
4. Calculate proficiency score (sources + recency)
5. Calculate recency score (time since verification)

## 🔐 Verification System

### Verification by API
```bash
GET /api/verify/by-id/:candidateId
```
Returns verifiable presentation with:
- Candidate information
- Verified skills with NSQF levels
- Proficiency and recency scores
- Cryptographic signature
- Source issuers and dates

### Verification by QR Code
```bash
POST /api/verify/by-qr
Body: { "qrData": "base64_encoded_data" }
```
QR codes expire after 24 hours and contain:
- Candidate ID
- Timestamp
- Verification URL

### Verifiable Presentations
Following W3C Verifiable Credentials standard:
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiablePresentation"],
  "verifiableCredential": [...],
  "holder": "did:candidate:123",
  "proof": {
    "type": "Ed25519Signature2020",
    "proofValue": "..."
  }
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+

### Installation

1. **Clone and Install**
```bash
npm install
```

2. **Configure Environment**
Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beckn_skill_verification
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB connection string for cloud
```

4. **Run the Application**
```bash
npm start
```

5. **Access the Application**
- Frontend: http://localhost:5000
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 📖 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick API Overview

**Authentication**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

**Candidate APIs** (Requires authentication)
- `GET /api/candidate/profile` - Get profile with skills
- `POST /api/candidate/credentials/add` - Add credential
- `GET /api/candidate/skill-graph` - Get skill graph
- `POST /api/candidate/refresh-verification` - Refresh verification
- `GET /api/candidate/qrcode` - Generate QR code

**Beckn APIs**
- `POST /api/beckn/search` - Search skill issuers
- `POST /api/beckn/select` - Select issuer
- `POST /api/beckn/confirm` - Confirm order
- `POST /api/beckn/status` - Check status
- `POST /api/beckn/support` - Get support info

**Verification APIs**
- `GET /api/verify/by-id/:candidateId` - Verify by ID
- `POST /api/verify/by-qr` - Verify by QR code
- `GET /api/verify/revocation/:credentialId` - Check revocation status

**Admin APIs** (Requires admin role)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/candidates` - List candidates
- `GET /api/admin/issuers` - List issuers
- `GET /api/admin/verification-logs` - Verification logs
- `GET /api/admin/beckn-logs` - Beckn transaction logs
- `GET /api/admin/errors` - Error logs

## 🎨 Frontend Pages

1. **Landing Page** (`index.html`) - Overview and features
2. **Login/Signup** (`login.html`, `signup.html`) - Authentication
3. **Candidate Dashboard** (`candidate-dashboard.html`) - Skill overview
4. **Add Credential** (`add-credential.html`) - Link credentials
5. **Skill Profile** (`skill-profile.html`) - Detailed profile & QR
6. **Employer Verify** (`employer-verify.html`) - Verification interface
7. **Admin Panel** (`admin.html`) - System monitoring

## 🔧 Database Models

- **User**: Candidates, employers, admins with roles
- **Credential**: Educational credentials, certifications
- **Skill**: Normalized skill taxonomy with NSQF mapping
- **CandidateSkillGraph**: Aggregated skill profiles
- **Issuer**: Credential issuers and assessors
- **BecknTransactionLog**: Beckn protocol transactions
- **VerificationLog**: Verification workflow logs

## 🔄 Background Jobs

Automated cron jobs for:
- **Daily**: Update recency scores
- **Every 6 hours**: Check expired credentials
- **On-demand**: Skill graph updates after credential addition

## 🧪 Testing the System

### Create Test Accounts
```bash
# Candidate account
POST /api/auth/signup
{
  "email": "candidate@test.com",
  "password": "test123",
  "name": "Test Candidate",
  "role": "candidate"
}

# Admin account
POST /api/auth/signup
{
  "email": "admin@test.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin"
}
```

### Add Test Credentials
Use credential IDs: `ONEST001`, `ONEST002`, or `ONEST003`

### Verify Skills
1. As employer, use verification page
2. Enter candidate ID
3. View verified skills and verifiable presentation

## 📊 Key Features Implemented

✅ Complete Beckn Protocol APIs (search, select, confirm, status, support)
✅ ONEST integration with mock endpoints
✅ NSQF-based skill mapping (8 levels)
✅ Multi-source credential aggregation
✅ Automated verification workflows
✅ API & QR-based verification
✅ JWT authentication with role-based access
✅ Verifiable presentations (W3C standard)
✅ Skill graph visualization
✅ Admin monitoring dashboard
✅ Background job processing
✅ Comprehensive logging

## 🔮 Future Enhancements

- Real ONEST API integration
- Blockchain-based credential signing
- AI-powered skill taxonomy mapping
- Third-party assessment platform integrations
- Advanced analytics and insights
- Mobile application
- Multi-language support

## 📄 License

MIT License

## 🤝 Contributing

This is a demonstration project showcasing Beckn Protocol and ONEST integration for skill verification networks.

---

Built with ❤️ using Beckn Protocol, ONEST, and NSQF standards
