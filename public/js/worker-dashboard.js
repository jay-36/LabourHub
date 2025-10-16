// worker-dashboard.js - ERROR-FREE version
console.log('👷 Worker dashboard loaded!');

const API_BASE = '/api';
let currentUser = null;

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    document.getElementById('userName').textContent = currentUser.name;
    
    // Load initial data
    loadUserProfile();
    loadJobs();
    loadRecommendations();
}

// Load user profile
async function loadUserProfile() {
    try {
        console.log('Loading profile for user:', currentUser.id);
        const response = await fetch(`${API_BASE}/user/${currentUser.id}`);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ Profile loaded:', userData);
            
            // Update displayed info
            document.getElementById('userRating').textContent = userData.rating ? userData.rating.toFixed(1) : '0.0';
            document.getElementById('appliedJobs').textContent = userData.jobs_applied || '0';
            
            // Update current user with fresh data
            currentUser = { ...currentUser, ...userData };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load recommendations
async function loadRecommendations() {
    try {
        const response = await fetch(`${API_BASE}/recommendations/worker/${currentUser.id}`);
        if (response.ok) {
            const recommendations = await response.json();
            displayRecommendations(recommendations);
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendationSection').innerHTML = `
            <div class="alert alert-warning">
                <p>Unable to load recommendations right now.</p>
            </div>
        `;
    }
}

// Display recommendations
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationList');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <p>Add your skills in your profile to get job recommendations!</p>
                </div>
            </div>
        `;
        return;
    }
    
    document.getElementById('recommendationText').textContent = 
        `We found ${recommendations.length} jobs that match your skills`;
    
    container.innerHTML = recommendations.map(job => `
        <div class="col-md-6 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="card-title">${job.title}</h6>
                        <span class="badge bg-success">${job.matchPercentage}% Match</span>
                    </div>
                    <p class="card-text small">${job.description}</p>
                    <div class="mb-2">
                        <strong>Skills needed:</strong> 
                        ${job.skills_required ? job.skills_required.split(',').map(skill => 
                            `<span class="badge bg-light text-dark me-1">${skill.trim()}</span>`
                        ).join('') : 'Any skills'}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <small class="text-muted">💰 $${job.wage}/hr</small><br>
                            <small class="text-muted">📍 ${job.location}</small>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="applyForJob(${job.id})">
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load jobs
async function loadJobs() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/jobs`);
        if (response.ok) {
            const jobs = await response.json();
            displayJobs(jobs);
        } else {
            throw new Error('Failed to load jobs');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsList').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <p>Error loading jobs. Please try again.</p>
                    <button class="btn btn-warning" onclick="loadJobs()">Try Again</button>
                </div>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Display jobs
function displayJobs(jobs) {
    const container = document.getElementById('jobsList');
    const noJobs = document.getElementById('noJobsMessage');
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '';
        noJobs.classList.remove('d-none');
        return;
    }
    
    noJobs.classList.add('d-none');
    container.innerHTML = jobs.map(job => `
        <div class="col-lg-6 mb-4">
            <div class="card job-card">
                <div class="card-body">
                    <h5 class="card-title text-primary">${job.title}</h5>
                    <p class="card-text">${job.description}</p>
                    <div class="job-details">
                        <p><strong>Category:</strong> ${job.category}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Wage:</strong> $${job.wage}/hour</p>
                        <p><strong>Employer:</strong> ${job.employer.name}</p>
                        ${job.skills_required ? `<p><strong>Skills needed:</strong> ${job.skills_required}</p>` : ''}
                    </div>
                    <button class="btn btn-primary mt-3" onclick="applyForJob(${job.id})">
                        ✨ Apply Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Apply for job
async function applyForJob(jobId) {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    try {
        console.log('Applying for job:', jobId);
        const response = await fetch(`${API_BASE}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_id: jobId,
                worker_id: currentUser.id
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update applied jobs count
            const current = parseInt(document.getElementById('appliedJobs').textContent) || 0;
            document.getElementById('appliedJobs').textContent = current + 1;
            
            alert('✅ ' + data.message);
            
            // Refresh profile to get updated count from database
            loadUserProfile();
            
        } else {
            const error = await response.json();
            alert('❌ ' + error.message);
        }
    } catch (error) {
        console.error('Application error:', error);
        alert('❌ Application failed. Please try again.');
    }
}

// Show profile modal
async function showProfileModal() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}`);
        
        if (response.ok) {
            const userData = await response.json();
            
            document.getElementById('profileContent').innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Your Information</h6>
                        <p><strong>Name:</strong> ${userData.name}</p>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Phone:</strong> ${userData.phone || 'Not provided'}</p>
                        <p><strong>Rating:</strong> ⭐ ${userData.rating ? userData.rating.toFixed(1) : '0.0'}</p>
                        <p><strong>Member since:</strong> ${new Date(userData.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="col-md-6">
                        <form id="skillsForm">
                            <div class="mb-3">
                                <label class="form-label"><strong>Your Skills</strong></label>
                                <textarea class="form-control" name="skills" rows="4" 
                                    placeholder="construction, plumbing, carpentry, cleaning, driving, etc.">${userData.skills || ''}</textarea>
                                <div class="form-text">Separate skills with commas</div>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">💾 Save Skills</button>
                        </form>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <h6>Your Activity</h6>
                        <div class="card">
                            <div class="card-body">
                                <p><strong>Jobs Applied:</strong> ${userData.jobs_applied || 0}</p>
                                <p><strong>Profile Views:</strong> ${userData.profile_views || 0}</p>
                                <p><strong>Total Reviews:</strong> ${userData.total_reviews || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${userData.reviews && userData.reviews.length > 0 ? `
                <div class="row mt-4">
                    <div class="col-12">
                        <h6>Your Reviews</h6>
                        ${userData.reviews.map(review => `
                            <div class="card mb-2">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <strong>${review.reviewer_name}</strong>
                                        <span>⭐ ${review.rating}/5</span>
                                    </div>
                                    <p class="mt-2 mb-1">${review.comment}</p>
                                    <small class="text-muted">${new Date(review.created_at).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : `
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <p class="mb-0">No reviews yet. Complete jobs to get reviews from employers!</p>
                        </div>
                    </div>
                </div>
                `}
            `;
            
            // Handle skills form
            document.getElementById('skillsForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const skills = formData.get('skills');
                
                try {
                    const response = await fetch(`${API_BASE}/user/${currentUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ skills: skills })
                    });
                    
                    if (response.ok) {
                        alert('✅ Skills updated successfully!');
                        bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
                        loadRecommendations();
                        loadUserProfile();
                    } else {
                        const error = await response.json();
                        alert('❌ Failed to update skills: ' + error.message);
                    }
                } catch (error) {
                    alert('❌ Error updating skills. Please try again.');
                }
            });
            
        } else {
            document.getElementById('profileContent').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load profile. Please try again.
                </div>
            `;
        }
    } catch (error) {
        document.getElementById('profileContent').innerHTML = `
            <div class="alert alert-danger">
                Error: ${error.message}
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

// Show loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Show review modal (for workers to review employers)
function showReviewModal(jobId, employerId, employerName) {
    document.getElementById('reviewJobId').value = jobId;
    document.getElementById('reviewToUserId').value = employerId;
    
    // Update modal title
    document.querySelector('#reviewModal .modal-title').textContent = `⭐ Review ${employerName}`;
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.textContent = '☆';
        star.style.color = '#6c757d';
    });
    document.getElementById('reviewRating').value = '';
    document.getElementById('reviewComment').value = '';
    
    // Add star click handlers
    document.querySelectorAll('.star').forEach(star => {
        star.onclick = function() {
            const rating = parseInt(this.dataset.rating);
            document.getElementById('reviewRating').value = rating;
            
            // Update star display
            document.querySelectorAll('.star').forEach((s, index) => {
                s.textContent = index < rating ? '★' : '☆';
                s.style.color = index < rating ? '#ffc107' : '#6c757d';
            });
        };
    });
    
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
}

// Handle review form submission
document.addEventListener('DOMContentLoaded', function() {
    // Check if review form exists on this page
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const reviewData = {
                from_user_id: currentUser.id,
                to_user_id: formData.get('to_user_id'),
                job_id: formData.get('job_id'),
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment')
            };
            
            if (!reviewData.rating) {
                alert('Please select a rating');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reviewData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    alert('✅ Review submitted successfully!');
                    bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
                    loadUserProfile(); // Refresh rating
                } else {
                    alert(`❌ Failed to submit review: ${data.message}`);
                }
            } catch (error) {
                console.error('Review submission error:', error);
                alert('❌ Failed to submit review. Please try again.');
            }
        });
    }
});

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('👷 Worker dashboard initialized');
    checkAuth();
});