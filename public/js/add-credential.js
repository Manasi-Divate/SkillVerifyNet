const API_URL = '/api';

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return null;
    }
    return token;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupLogout();
    const token = checkAuth();
    if (!token) return;

    const form = document.getElementById('addCredentialForm');
    const statusDiv = document.getElementById('statusMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusDiv.textContent = '';
        statusDiv.classList.remove('show', 'success', 'error');

        const formData = {
            credentialReferenceId: document.getElementById('credentialReferenceId').value,
            issuerType: document.getElementById('issuerType').value
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';

        try {
            const response = await fetch(`${API_URL}/candidate/credentials/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                statusDiv.textContent = 'Credential added successfully! Redirecting...';
                statusDiv.classList.add('show', 'success');
                
                setTimeout(() => {
                    window.location.href = '/candidate-dashboard.html';
                }, 2000);
            } else {
                statusDiv.textContent = data.error || 'Failed to add credential';
                statusDiv.classList.add('show', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Credential';
            }
        } catch (error) {
            statusDiv.textContent = 'Network error. Please try again.';
            statusDiv.classList.add('show', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Credential';
        }
    });
});
