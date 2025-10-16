// auth.js - COMPLETE VERSION WITH OTP & PASSWORD VALIDATION
console.log('🔐 Auth system loaded!');

const API_BASE = '/api';

// Password validation rules
const passwordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
};

// OTP state
let otpTimer = null;
let otpTimeLeft = 0;
let currentRegistrationData = null;

// Check if user is already logged in
function checkExistingLogin() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        redirectToDashboard(userData.userType);
    }
}

// Show login form
function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'none';
    resetForms();
}

// Show register form
function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'none';
    resetForms();
}

// Show OTP form
function showOTPForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
    document.getElementById('forgotPasswordSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'none';
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'block';
    document.getElementById('resetPasswordSection').style.display = 'none';
    resetForms();
}

// Show reset password form
function showResetPassword() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('forgotPasswordSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'block';
}

// Redirect to appropriate dashboard
function redirectToDashboard(userType) {
    if (userType === 'worker') {
        window.location.href = 'worker-dashboard.html';
    } else if (userType === 'employer') {
        window.location.href = 'employer-dashboard.html';
    }
}

// Validate password strength
function validatePassword(password) {
    const errors = [];
    const requirements = {
        length: password.length >= passwordRules.minLength,
        uppercase: passwordRules.requireUppercase ? /[A-Z]/.test(password) : true,
        lowercase: passwordRules.requireLowercase ? /[a-z]/.test(password) : true,
        numbers: passwordRules.requireNumbers ? /\d/.test(password) : true,
        special: passwordRules.requireSpecialChars ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) : true
    };

    if (!requirements.length) {
        errors.push(`At least ${passwordRules.minLength} characters`);
    }
    if (!requirements.uppercase) {
        errors.push('One uppercase letter (A-Z)');
    }
    if (!requirements.lowercase) {
        errors.push('One lowercase letter (a-z)');
    }
    if (!requirements.numbers) {
        errors.push('One number (0-9)');
    }
    if (!requirements.special) {
        errors.push('One special character (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        strength: calculatePasswordStrength(password)
    };
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
    
    return Math.min(Math.floor(strength / 2), 4); // 0-4 scale
}

// Update password strength meter
function updatePasswordStrength(password, meterId = 'passwordStrength', textId = 'passwordStrengthText', requirementsId = 'passwordRequirements') {
    const strengthMeter = document.getElementById(meterId);
    const strengthText = document.getElementById(textId);
    const requirementsList = document.getElementById(requirementsId);
    
    if (!strengthMeter || !password) return;
    
    const validation = validatePassword(password);
    const strength = validation.strength;
    
    // Update strength meter
    strengthMeter.className = 'password-strength-meter strength-' + strength;
    strengthMeter.innerHTML = '<div class="strength-bar"></div>'.repeat(4);
    
    // Update strength text
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    strengthText.textContent = strengthLabels[strength];
    strengthText.className = 'strength-text strength-' + strength;
    
    // Update requirements list
    if (requirementsList) {
        requirementsList.innerHTML = validation.errors.map(error => 
            `<li class="text-danger">❌ ${error}</li>`
        ).concat(
            validation.errors.length === 0 ? 
            ['<li class="text-success">✅ All requirements met!</li>'] : 
            []
        ).join('');
    }
}

// Handle password input
function setupPasswordValidation() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const meterId = this.id === 'regPassword' ? 'passwordStrength' : 
                           this.id === 'resetPassword' ? 'resetPasswordStrength' : 'passwordStrength';
            const textId = this.id === 'regPassword' ? 'passwordStrengthText' : 
                          this.id === 'resetPassword' ? 'resetPasswordStrengthText' : 'passwordStrengthText';
            const requirementsId = this.id === 'regPassword' ? 'passwordRequirements' : 
                                  this.id === 'resetPassword' ? 'resetPasswordRequirements' : 'passwordRequirements';
            
            updatePasswordStrength(e.target.value, meterId, textId, requirementsId);
        });
        
        input.addEventListener('focus', function() {
            const requirementsId = this.id === 'regPassword' ? 'passwordRequirements' : 
                                  this.id === 'resetPassword' ? 'resetPasswordRequirements' : 'passwordRequirements';
            const requirementsList = document.getElementById(requirementsId);
            if (requirementsList) {
                requirementsList.classList.remove('d-none');
            }
        });
    });
}

// Start OTP timer
function startOTPTimer(duration = 600) { // 10 minutes default
    otpTimeLeft = duration;
    updateOTPTimer();
    
    if (otpTimer) clearInterval(otpTimer);
    
    otpTimer = setInterval(() => {
        otpTimeLeft--;
        updateOTPTimer();
        
        if (otpTimeLeft <= 0) {
            clearInterval(otpTimer);
            document.getElementById('otpTimer').innerHTML = 'OTP expired';
            document.getElementById('resendOtp').classList.remove('d-none');
        }
    }, 1000);
}

// Update OTP timer display
function updateOTPTimer() {
    const minutes = Math.floor(otpTimeLeft / 60);
    const seconds = otpTimeLeft % 60;
    document.getElementById('otpTimer').textContent = 
        `Time left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Send OTP for registration
async function sendOTP() {
    const formData = new FormData(document.getElementById('registerForm'));
    const email = formData.get('email');
    
    if (!email) {
        alert('Please enter your email first');
        return;
    }
    
    // Store registration data
    currentRegistrationData = {
        name: formData.get('name'),
        email: email,
        password: formData.get('password'),
        userType: formData.get('userType'),
        phone: formData.get('phone')
    };
    
    // Validate data before sending OTP
    if (!currentRegistrationData.name || !currentRegistrationData.password || !currentRegistrationData.userType) {
        alert('Please fill in all required fields');
        return;
    }
    
    const passwordValidation = validatePassword(currentRegistrationData.password);
    if (!passwordValidation.isValid) {
        alert('Please fix the password requirements:\n' + passwordValidation.errors.join('\n'));
        return;
    }
    
    try {
        document.getElementById('otpSpinner').classList.remove('d-none');
        document.getElementById('sendOtpBtn').disabled = true;
        
        const response = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`✅ OTP sent successfully! For demo, your OTP is: ${data.otp}`);
            showOTPForm();
            document.getElementById('otpEmail').textContent = email;
            startOTPTimer();
        } else {
            alert(`❌ Failed to send OTP: ${data.message}`);
        }
    } catch (error) {
        console.error('OTP sending error:', error);
        alert('❌ Failed to send OTP. Please try again.');
    } finally {
        document.getElementById('otpSpinner').classList.add('d-none');
        document.getElementById('sendOtpBtn').disabled = false;
    }
}

// Verify OTP and register
async function verifyOTP() {
    const otp = document.getElementById('otpCode').value;
    
    if (!otp || otp.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    if (!currentRegistrationData) {
        alert('Registration data not found. Please start over.');
        showRegister();
        return;
    }
    
    try {
        document.getElementById('verifyOtpSpinner').classList.remove('d-none');
        document.getElementById('verifyOtpBtn').disabled = true;
        
        const response = await fetch(`${API_BASE}/auth/verify-otp-register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentRegistrationData,
                otp: otp
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Registration successful!');
            
            // Auto-login after registration
            const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentRegistrationData.email,
                    password: currentRegistrationData.password
                })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok) {
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify(loginData));
                
                // Redirect to dashboard
                redirectToDashboard(loginData.userType);
            } else {
                alert('Registration successful! Please login manually.');
                showLogin();
            }
        } else {
            alert(`❌ OTP verification failed: ${data.message}`);
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        alert('❌ OTP verification failed. Please try again.');
    } finally {
        document.getElementById('verifyOtpSpinner').classList.add('d-none');
        document.getElementById('verifyOtpBtn').disabled = false;
    }
}

// Send password reset OTP
async function sendResetOTP() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    try {
        document.getElementById('resetOtpSpinner').classList.remove('d-none');
        document.getElementById('sendResetOtpBtn').disabled = true;
        
        const response = await fetch(`${API_BASE}/auth/send-reset-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`✅ Password reset OTP sent! For demo, your OTP is: ${data.otp}`);
            document.getElementById('resetOtpEmail').textContent = email;
            showResetPassword();
            startOTPTimer();
        } else {
            alert(`❌ Failed to send reset OTP: ${data.message}`);
        }
    } catch (error) {
        console.error('Reset OTP sending error:', error);
        alert('❌ Failed to send reset OTP. Please try again.');
    } finally {
        document.getElementById('resetOtpSpinner').classList.add('d-none');
        document.getElementById('sendResetOtpBtn').disabled = false;
    }
}

// Reset password with OTP
async function resetPassword() {
    const email = document.getElementById('resetOtpEmail').textContent;
    const otp = document.getElementById('resetOtpCode').value;
    const newPassword = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;
    
    if (!otp || otp.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    if (!newPassword || !confirmPassword) {
        alert('Please fill in all password fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        alert('Please fix the password requirements:\n' + passwordValidation.errors.join('\n'));
        return;
    }
    
    try {
        document.getElementById('resetPasswordSpinner').classList.remove('d-none');
        document.getElementById('resetPasswordBtn').disabled = true;
        
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                otp: otp,
                newPassword: newPassword
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Password reset successful! You can now login with your new password.');
            showLogin();
        } else {
            alert(`❌ Password reset failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        alert('❌ Password reset failed. Please try again.');
    } finally {
        document.getElementById('resetPasswordSpinner').classList.add('d-none');
        document.getElementById('resetPasswordBtn').disabled = false;
    }
}

// Reset all forms
function resetForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('otpForm').reset();
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetPasswordForm').reset();
    
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
    
    currentRegistrationData = null;
    updatePasswordStrength('');
}

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🔑 Login attempt...');
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading
    document.getElementById('loadingSpinner').classList.remove('d-none');
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login successful:', data);
            
            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(data));
            
            // Redirect to dashboard
            redirectToDashboard(data.userType);
            
        } else {
            alert(`❌ Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Login failed. Please check your connection and try again.');
    } finally {
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
});

// Handle register form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendOTP();
});

// Handle OTP form submission
document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await verifyOTP();
});

// Handle forgot password form submission
document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendResetOTP();
});

// Handle reset password form submission
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await resetPassword();
});

// Resend OTP
function resendOTP() {
    if (currentRegistrationData) {
        sendOTP();
    } else {
        alert('No registration data found. Please start over.');
        showRegister();
    }
}

// Check for existing login when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Homepage loaded');
    checkExistingLogin();
    
    // Show login form by default
    showLogin();
    
    // Setup password validation
    setupPasswordValidation();
});