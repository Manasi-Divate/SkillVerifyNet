const API_URL = '/api';

if (window.location.pathname.includes('signup.html')) {
    const signupForm = document.getElementById('signupForm');
    const roleSelect = document.getElementById('role');
    const organizationGroup = document.getElementById('organizationGroup');

    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'employer' || roleSelect.value === 'admin') {
            organizationGroup.style.display = 'block';
        } else {
            organizationGroup.style.display = 'none';
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value,
            role: document.getElementById('role').value,
            organization: document.getElementById('organization').value
        };

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role === 'candidate') {
                    window.location.href = '/candidate-dashboard.html';
                } else if (data.user.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/employer-verify.html';
                }
            } else {
                errorDiv.textContent = data.error || 'Signup failed';
                errorDiv.classList.add('show');
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.classList.add('show');
        }
    });
}

if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role === 'candidate') {
                    window.location.href = '/candidate-dashboard.html';
                } else if (data.user.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/employer-verify.html';
                }
            } else {
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.classList.add('show');
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.classList.add('show');
        }
    });
}

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
