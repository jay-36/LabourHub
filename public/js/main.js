// main.js - Frontend JavaScript with better error handling
console.log('✅ main.js loaded successfully!');

const API_BASE = '/api'; // Use relative path

// Global variables
let currentUser = null;

// When page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Website loaded! Ready to use.');
    showWelcomeMessage();
});

function showWelcomeMessage() {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.innerHTML = `
            <div class="alert alert-success">
                <h4>🎉 Welcome to LabourHub!</h4>
                <p>Your labour hiring website is running successfully.</p>
                <button class="btn btn-primary" onclick="loadJobs()">View Available Jobs</button>
                <button class="btn btn-outline-primary" onclick="testAPI()">Test API Connection</button>
            </div>
        `;
    }
}

// Test API connection
async function testAPI() {
    try {
        console.log('Testing API connection...');
        const response = await fetch(`${API_BASE}/test`);
        const data = await response.json();
        
        alert(`✅ API Test Successful!\n\nMessage: ${data.message}\nUsers: ${data.usersCount}\nTime: ${data.timestamp}`);
    } catch (error) {
        alert(`❌ API Test Failed:\n\n${error.message}`);
    }
}

// Load jobs from API
async function loadJobs() {
    console.log('📡 Loading jobs from API...');
    
    // Show loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusMessage = document.getElementById('statusMessage');
    const jobListings = document.getElementById('jobListings');
    
    if (loadingSpinner) loadingSpinner.classList.remove('d-none');
    if (statusMessage) statusMessage.classList.add('d-none');
    if (jobListings) jobListings.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/jobs`);
        console.log('📊 API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const jobs = await response.json();
        console.log('✅ Jobs loaded successfully:', jobs.length, 'jobs found');
        
        displayJobs(jobs);
        
    } catch (error) {
        console.error('❌ Error loading jobs:', error);
        
        if (jobListings) {
            jobListings.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h4>😞 Unable to load jobs</h4>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p>This might be because:</p>
                        <ul>
                            <li>The server is not running</li>
                            <li>There's a network connection issue</li>
                            <li>The API endpoint has changed</li>
                        </ul>
                        <button class="btn btn-warning me-2" onclick="loadJobs()">Try Again</button>
                        <button class="btn btn-info" onclick="testAPI()">Test API</button>
                    </div>
                </div>
            `;
        }
    } finally {
        // Hide loading spinner
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
    }
}

// Display jobs on the page
function displayJobs(jobs) {
    const jobsContainer = document.getElementById('jobListings');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!jobsContainer) return;
    
    if (!jobs || jobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning">
                    <h4>📭 No jobs available</h4>
                    <p>There are no job listings at the moment. Check back later!</p>
                    <button class="btn btn-success" onclick="addSampleJobs()">Add Sample Jobs</button>
                </div>
            </div>
        `;
        return;
    }
    
    jobsContainer.innerHTML = jobs.map(job => `
        <div class="col-lg-6 mb-4">
            <div class="card job-card">
                <div class="card-body">
                    <h5 class="card-title text-primary">${job.title}</h5>
                    <p class="card-text">${job.description}</p>
                    <div class="job-details">
                        <p><strong>🏢 Category:</strong> ${job.category}</p>
                        <p><strong>📍 Location:</strong> ${job.location}</p>
                        <p><strong>💰 Wage:</strong> $${job.wage}/hour</p>
                        <p><strong>👨‍💼 Employer:</strong> ${job.employer.name}</p>
                    </div>
                    <button class="btn btn-primary mt-3" onclick="applyForJob(${job.id})">
                        ✨ Apply Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (statusMessage) {
        statusMessage.innerHTML = `
            <div class="alert alert-success">
                <strong>🎯 Found ${jobs.length} job${jobs.length !== 1 ? 's' : ''} available!</strong>
                <button class="btn btn-sm btn-outline-success float-end" onclick="loadJobs()">Refresh</button>
            </div>
        `;
    }
}

// Show login modal
function showLogin() {
    console.log('Opening login modal');
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

// Show register modal
function showRegister() {
    console.log('Opening register modal');
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

// Show post job (for employers)
function showPostJob() {
    alert('👷 This feature is coming soon! Employers will be able to post jobs here.');
}

// Apply for job
function applyForJob(jobId) {
    if (!currentUser) {
        alert('Please login or register to apply for jobs!');
        showLogin();
        return;
    }
    alert(`✅ Application submitted for Job #${jobId}! (This is a demo)`);
}

// Handle login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
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
            currentUser = data;
            alert('🎉 Login successful! Welcome back!');
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            e.target.reset();
        } else {
            alert(`❌ Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Login failed. Please check your connection and try again.');
    }
});

// Handle register form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    
    const formData = new FormData(e.target);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        userType: formData.get('userType')
    };
    
    if (!registerData.userType) {
        alert('Please select whether you are a Worker or Employer');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('🎉 Registration successful! Please login with your new account.');
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            e.target.reset();
            showLogin();
        } else {
            alert(`❌ Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('❌ Registration failed. Please check your connection and try again.');
    }
});

// Add sample jobs for testing
function addSampleJobs() {
    const sampleJobs = [
        {
            id: 1,
            title: "Construction Worker",
            description: "Help with residential building project. No experience required, training provided.",
            category: "Construction",
            location: "New York",
            wage: 25,
            employer: { name: "BuildCorp Inc" }
        },
        {
            id: 2,
            title: "House Cleaning Professional",
            description: "Weekly house cleaning service for residential properties.",
            category: "Cleaning",
            location: "Los Angeles", 
            wage: 20,
            employer: { name: "Clean Homes Co" }
        }
    ];
    displayJobs(sampleJobs);
}

console.log('🌟 LabourHub frontend initialized!');