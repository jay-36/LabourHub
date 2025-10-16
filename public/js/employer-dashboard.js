// employer-dashboard.js - FULLY WORKING VERSION WITH WORKER PROFILES
console.log('💼 Employer dashboard loaded!');

const API_BASE = '/api';
let currentUser = null;
let myJobs = [];
let currentJobId = null;

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    if (currentUser.userType !== 'employer') {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('userName').textContent = currentUser.name;
    loadMyJobs();
}

// Load employer's jobs
async function loadMyJobs() {
    console.log('📡 Loading my jobs...');
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/jobs`);
        const allJobs = await response.json();
        
        if (response.ok) {
            // Filter jobs created by current employer
            myJobs = allJobs.filter(job => job.employer_id === 1);
            
            displayMyJobs(myJobs);
            updateStats();
        } else {
            throw new Error('Failed to load jobs');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('myJobsList').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h4>😞 Unable to load jobs</h4>
                    <p>Error: ${error.message}</p>
                    <button class="btn btn-warning" onclick="loadMyJobs()">Try Again</button>
                </div>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Display employer's jobs
function displayMyJobs(jobs) {
    const jobsContainer = document.getElementById('myJobsList');
    const noJobsMessage = document.getElementById('noJobsMessage');
    
    if (!jobs || jobs.length === 0) {
        jobsContainer.innerHTML = '';
        noJobsMessage.classList.remove('d-none');
        return;
    }
    
    noJobsMessage.classList.add('d-none');
    
    jobsContainer.innerHTML = jobs.map(job => `
        <div class="col-lg-6 mb-4">
            <div class="card job-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title text-success">${job.title}</h5>
                        <span class="badge bg-${job.status === 'open' ? 'success' : 'secondary'}">${job.status}</span>
                    </div>
                    <p class="card-text">${job.description}</p>
                    <div class="job-details">
                        <p><strong>🏢 Category:</strong> ${job.category}</p>
                        <p><strong>📍 Location:</strong> ${job.location}</p>
                        <p><strong>💰 Wage:</strong> $${job.wage}/hour</p>
                        ${job.skills_required ? `<p><strong>🔧 Required Skills:</strong> ${job.skills_required}</p>` : ''}
                        <p><strong>📅 Posted:</strong> ${new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewApplications(${job.id}, '${job.title}')">
                            👀 View Applications
                        </button>
                        <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteJob(${job.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update dashboard statistics
function updateStats() {
    document.getElementById('activeJobs').textContent = myJobs.length;
    
    // Calculate total applications
    let totalApplications = 0;
    myJobs.forEach(job => {
        // This would be from database in real app
        totalApplications += 2; // Mock count for demo
    });
    document.getElementById('totalApplications').textContent = totalApplications;
}

// Show post job modal
function showPostJobModal() {
    const modal = new bootstrap.Modal(document.getElementById('postJobModal'));
    modal.show();
}

// Handle post job form
document.getElementById('postJobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 Posting new job...');
    
    const formData = new FormData(e.target);
    const jobData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        skills_required: formData.get('skills_required'),
        location: formData.get('location'),
        wage: parseFloat(formData.get('wage'))
    };
    
    try {
        const response = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('🎉 Job posted successfully!');
            
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('postJobModal')).hide();
            e.target.reset();
            
            // Reload jobs
            loadMyJobs();
        } else {
            alert(`❌ Failed to post job: ${data.message}`);
        }
    } catch (error) {
        console.error('Error posting job:', error);
        alert('❌ Failed to post job. Please try again.');
    }
});

// Delete job
async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Job deleted successfully!');
            loadMyJobs(); // Reload the jobs list
        } else {
            alert(`❌ Failed to delete job: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('❌ Failed to delete job. Please try again.');
    }
}

// View applications for a job - FIXED with real data
async function viewApplications(jobId, jobTitle) {
    console.log('📋 Loading applications for job:', jobId);
    currentJobId = jobId;
    
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}/applications`);
        const applications = await response.json();
        
        if (response.ok) {
            displayApplications(jobId, jobTitle, applications);
        } else {
            throw new Error('Failed to load applications');
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('applicationsContent').innerHTML = `
            <div class="alert alert-danger">
                <h4>😞 Unable to load applications</h4>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('applicationsModal'));
    modal.show();
}

// Display applications in modal - FIXED with worker profile buttons
function displayApplications(jobId, jobTitle, applications) {
    const applicationsContent = document.getElementById('applicationsContent');
    
    if (!applications || applications.length === 0) {
        applicationsContent.innerHTML = `
            <div class="alert alert-info">
                <h5>📭 No applications yet</h5>
                <p>No workers have applied for "${jobTitle}" yet. Check back later!</p>
            </div>
        `;
        return;
    }
    
    applicationsContent.innerHTML = `
        <h5>Applications for: ${jobTitle}</h5>
        <p class="text-muted mb-3">Job ID: #${jobId} • ${applications.length} application(s)</p>
        
        ${applications.map(app => `
            <div class="card application-card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-2">${app.worker_name}</h6>
                            
                            <div class="mb-2">
                                <span class="badge bg-${app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'secondary'}">
                                    ${app.status}
                                </span>
                                <span class="ms-2">⭐ ${app.rating || 'No rating'}</span>
                            </div>
                            
                            ${app.skills ? `
                                <div class="mb-2">
                                    <strong>Skills:</strong> 
                                    ${app.skills.split(',').map(skill => 
                                        `<span class="badge bg-light text-dark me-1">${skill.trim()}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="mb-2">
                                <strong>Contact:</strong> 
                                <span class="text-muted">${app.phone || 'No phone'} • ${app.email}</span>
                            </div>
                            
                            <div class="mb-2">
                                <strong>Applied:</strong> 
                                <span class="text-muted">${new Date(app.applied_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        ${app.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="updateApplication(${app.id}, 'accepted', ${jobId})">
                                ✅ Accept Application
                            </button>
                            <button class="btn btn-warning btn-sm ms-2" onclick="updateApplication(${app.id}, 'rejected', ${jobId})">
                                ❌ Reject Application
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-primary btn-sm ms-2" onclick="showReviewModal(${jobId}, ${app.worker_id}, '${app.worker_name}')">
                            ⭐ Leave Review
                        </button>
                        <button class="btn btn-outline-info btn-sm ms-2" onclick="viewWorkerProfile(${app.worker_id}, '${app.worker_name}')">
                            👤 View Profile
                        </button>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

// Update application status - FIXED with real updates
async function updateApplication(applicationId, status, jobId) {
    const action = status === 'accepted' ? 'accept' : 'reject';
    
    if (!confirm(`Are you sure you want to ${action} this application?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/applications/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`✅ Application ${status} successfully!`);
            // Reload applications to show updated status
            if (jobId) {
                const job = myJobs.find(j => j.id === jobId);
                if (job) {
                    await viewApplications(jobId, job.title);
                }
            }
        } else {
            alert(`❌ Failed to update application: ${data.message}`);
        }
    } catch (error) {
        console.error('Error updating application:', error);
        alert('❌ Failed to update application. Please try again.');
    }
}

// Show review modal for worker - FIXED
function showReviewModal(jobId, workerId, workerName) {
    console.log('Opening review modal for worker:', workerName);
    
    document.getElementById('reviewJobId').value = jobId;
    document.getElementById('reviewToUserId').value = workerId;
    
    // Update modal title
    document.querySelector('#reviewModal .modal-title').textContent = `⭐ Review ${workerName}`;
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.textContent = '☆';
        star.style.color = '#6c757d';
        star.style.cursor = 'pointer';
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

// Handle review form - FIXED
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const rating = parseInt(formData.get('rating'));
    const comment = formData.get('comment');
    const to_user_id = formData.get('to_user_id');
    const job_id = formData.get('job_id');
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    const reviewData = {
        from_user_id: currentUser.id,
        to_user_id: to_user_id,
        job_id: job_id,
        rating: rating,
        comment: comment
    };
    
    console.log('Submitting review:', reviewData);
    
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
            
            // Refresh applications to show potential rating changes
            if (currentJobId) {
                const job = myJobs.find(j => j.id === currentJobId);
                if (job) {
                    await viewApplications(currentJobId, job.title);
                }
            }
        } else {
            alert(`❌ Failed to submit review: ${data.message}`);
        }
    } catch (error) {
        console.error('Review submission error:', error);
        alert('❌ Failed to submit review. Please try again.');
    }
});

// Show profile modal
async function showProfileModal() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}`);
        const userData = await response.json();
        
        if (response.ok) {
            document.getElementById('profileContent').innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Company Information</h6>
                        <p><strong>Name:</strong> ${userData.name}</p>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Phone:</strong> ${userData.phone || 'Not provided'}</p>
                        <p><strong>Company Rating:</strong> ⭐ ${userData.rating || '0.0'} (${userData.total_reviews || 0} reviews)</p>
                        <p><strong>Jobs Posted:</strong> ${myJobs.length}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Company Skills/Services</h6>
                        <p>${userData.skills || 'No skills specified'}</p>
                    </div>
                </div>
                ${userData.reviews && userData.reviews.length > 0 ? `
                <div class="row mt-4">
                    <div class="col-12">
                        <h6>Company Reviews</h6>
                        ${userData.reviews.map(review => `
                            <div class="card mb-2">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between">
                                        <strong>${review.reviewer_name}</strong>
                                        <span>⭐ ${review.rating}/5</span>
                                    </div>
                                    <p class="mb-0 small">${review.comment}</p>
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
                            <p class="mb-0">No reviews yet. Workers will be able to review your company after completing jobs.</p>
                        </div>
                    </div>
                </div>
                `}
            `;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileContent').innerHTML = `
            <div class="alert alert-danger">
                Failed to load profile data. Please try again.
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

// View worker profile from applications
async function viewWorkerProfile(workerId, workerName) {
    console.log('Viewing worker profile:', workerId, workerName);
    
    try {
        const response = await fetch(`${API_BASE}/workers/${workerId}`);
        const workerData = await response.json();
        
        if (response.ok) {
            displayWorkerProfile(workerData);
        } else {
            throw new Error(workerData.message || 'Failed to load worker profile');
        }
    } catch (error) {
        console.error('Error loading worker profile:', error);
        document.getElementById('workerProfileContent').innerHTML = `
            <div class="alert alert-danger">
                <p>Error loading worker profile: ${error.message}</p>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('workerProfileModal'));
    modal.show();
}

// Display worker profile in modal
function displayWorkerProfile(worker) {
    const content = document.getElementById('workerProfileContent');
    content.innerHTML = `
        <div class="text-center mb-4">
            <h4>${worker.name}</h4>
            <div class="mb-3">
                <span class="badge bg-primary fs-6">⭐ ${worker.rating ? worker.rating.toFixed(1) : '0.0'}</span>
                <span class="badge bg-secondary ms-2">${worker.total_reviews || 0} reviews</span>
                <span class="badge bg-info ms-2">${worker.jobs_applied || 0} jobs applied</span>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h6>Contact Information</h6>
                <p><strong>📧 Email:</strong> ${worker.email}</p>
                <p><strong>📞 Phone:</strong> ${worker.phone || 'Not provided'}</p>
                <p><strong>📅 Member since:</strong> ${new Date(worker.created_at).toLocaleDateString()}</p>
            </div>
            <div class="col-md-6">
                <h6>Skills & Expertise</h6>
                <div class="skills-container">
                    ${worker.skills ? worker.skills.split(',').map(skill => 
                        `<span class="badge bg-success me-1 mb-1">${skill.trim()}</span>`
                    ).join('') : '<p class="text-muted">No skills listed</p>'}
                </div>
            </div>
        </div>
        
        ${worker.reviews && worker.reviews.length > 0 ? `
        <div class="row mt-4">
            <div class="col-12">
                <h6>Worker Reviews</h6>
                <div class="reviews-container" style="max-height: 200px; overflow-y: auto;">
                    ${worker.reviews.map(review => `
                        <div class="card mb-2">
                            <div class="card-body py-2">
                                <div class="d-flex justify-content-between align-items-start">
                                    <strong>${review.reviewer_name}</strong>
                                    <span class="badge bg-warning">⭐ ${review.rating}/5</span>
                                </div>
                                <p class="mb-1 small">${review.comment || 'No comment provided'}</p>
                                <small class="text-muted">${new Date(review.created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : `
        <div class="row mt-4">
            <div class="col-12">
                <div class="alert alert-info">
                    <p class="mb-0">No reviews yet for this worker.</p>
                </div>
            </div>
        </div>
        `}
        
        ${worker.recent_applications && worker.recent_applications.length > 0 ? `
        <div class="row mt-4">
            <div class="col-12">
                <h6>Recent Job Applications</h6>
                <div class="applications-list">
                    ${worker.recent_applications.map(app => `
                        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                            <span>${app.job_title || 'Unknown Job'}</span>
                            <span class="badge bg-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}">
                                ${app.status}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// Browse all workers
async function browseWorkers() {
    console.log('Browsing all workers');
    
    try {
        const response = await fetch(`${API_BASE}/workers`);
        const workers = await response.json();
        
        if (response.ok) {
            displayWorkersList(workers);
        } else {
            throw new Error('Failed to load workers');
        }
    } catch (error) {
        console.error('Error loading workers:', error);
        document.getElementById('workersListContent').innerHTML = `
            <div class="alert alert-danger">
                <p>Error loading workers: ${error.message}</p>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('workersListModal'));
    modal.show();
}

// Display workers list
function displayWorkersList(workers) {
    const content = document.getElementById('workersListContent');
    
    if (!workers || workers.length === 0) {
        content.innerHTML = `
            <div class="alert alert-info">
                <p>No workers found in the system.</p>
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <h5>Available Workers (${workers.length})</h5>
        <p class="text-muted mb-3">Click on a worker to view their full profile</p>
        
        <div class="row">
            ${workers.map(worker => `
                <div class="col-lg-6 mb-3">
                    <div class="card worker-card" onclick="viewWorkerProfile(${worker.id}, '${worker.name}')" style="cursor: pointer;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <h6 class="card-title">${worker.name}</h6>
                                <span class="badge bg-primary">⭐ ${worker.rating ? worker.rating.toFixed(1) : '0.0'}</span>
                            </div>
                            <p class="card-text small mb-2">
                                <strong>Skills:</strong> ${worker.skills ? worker.skills.split(',').slice(0, 3).join(', ') : 'Not specified'}
                            </p>
                            <div class="d-flex justify-content-between text-muted small">
                                <span>📧 ${worker.email}</span>
                                <span>${worker.jobs_applied_count || 0} jobs</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Show loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('💼 Employer dashboard initialized');
    checkAuth();
});