const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    const verifyByIdForm = document.getElementById('verifyByIdForm');
    verifyByIdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const candidateId = document.getElementById('candidateId').value;
        
        try {
            const response = await fetch(`${API_URL}/verify/by-id/${candidateId}`);
            const data = await response.json();
            
            if (data.success) {
                displayVerificationResult(data.verification);
            } else {
                alert('Verification failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to verify candidate');
        }
    });

    const verifyByQRForm = document.getElementById('verifyByQRForm');
    verifyByQRForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const qrData = document.getElementById('qrData').value;
        
        try {
            const response = await fetch(`${API_URL}/verify/by-qr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrData })
            });
            const data = await response.json();
            
            if (data.success && data.verification.valid) {
                displayVerificationResult(data.verification);
            } else {
                displayInvalidResult(data.verification.reason);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to verify QR code');
        }
    });
});

function displayVerificationResult(verification) {
    const resultDiv = document.getElementById('verificationResult');
    const statusBadge = document.getElementById('verificationStatus');
    const candidateInfo = document.getElementById('candidateInfo');
    const skillsInfo = document.getElementById('skillsInfo');
    const vpJson = document.getElementById('vpJson');

    statusBadge.className = 'status-badge verified';
    statusBadge.textContent = '✓ Verified';

    candidateInfo.innerHTML = `
        <h3>Candidate Information</h3>
        <p><strong>Name:</strong> ${verification.candidateName}</p>
        <p><strong>Overall Score:</strong> ${Math.round(verification.overallScore || 0)}/100</p>
        <p><strong>Total Skills:</strong> ${verification.skillCount}</p>
        <p><strong>Verified At:</strong> ${new Date(verification.timestamp).toLocaleString()}</p>
    `;

    skillsInfo.innerHTML = `
        <h3>Verified Skills</h3>
        ${verification.skills.map(skill => `
            <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">
                <strong>${skill.name}</strong>
                <span class="skill-badge level-${skill.nsqfLevel}">Level ${skill.nsqfLevel}</span>
                <div style="margin-top: 0.5rem; font-size: 0.875rem;">
                    Proficiency: ${skill.proficiency}% | Recency: ${skill.recencyScore}%
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-light);">
                    Sources: ${skill.sources.map(s => s.issuer).join(', ')}
                </div>
            </div>
        `).join('')}
    `;

    vpJson.textContent = JSON.stringify(verification.verifiablePresentation, null, 2);

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function displayInvalidResult(reason) {
    const resultDiv = document.getElementById('verificationResult');
    const statusBadge = document.getElementById('verificationStatus');
    const candidateInfo = document.getElementById('candidateInfo');
    const skillsInfo = document.getElementById('skillsInfo');

    statusBadge.className = 'status-badge invalid';
    statusBadge.textContent = '✗ Invalid';

    candidateInfo.innerHTML = `
        <h3>Verification Failed</h3>
        <p><strong>Reason:</strong> ${reason}</p>
    `;

    skillsInfo.innerHTML = '';
    document.getElementById('verifiablePresentation').style.display = 'none';

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}
