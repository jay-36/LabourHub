// database.js - COMPLETE version with all columns
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'labour-hiring-complete.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Using COMPLETE database file: labour-hiring-complete.db');

function initializeDatabase() {
    db.serialize(() => {
        console.log('🔄 Creating COMPLETE database tables...');
        
        // Drop all tables first to ensure clean start
        db.run(`DROP TABLE IF EXISTS applications`);
        db.run(`DROP TABLE IF EXISTS reviews`);
        db.run(`DROP TABLE IF EXISTS user_activities`);
        db.run(`DROP TABLE IF EXISTS jobs`);
        db.run(`DROP TABLE IF EXISTS users`);

        // Users table - COMPLETE with ALL columns
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            userType TEXT NOT NULL,
            phone TEXT,
            skills TEXT DEFAULT '',
            rating REAL DEFAULT 0,
            total_reviews INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            profile_views INTEGER DEFAULT 0,
            jobs_applied INTEGER DEFAULT 0,
            jobs_posted INTEGER DEFAULT 0
        )`, (err) => {
            if (err) console.error('❌ Users table error:', err);
            else console.log('✅ Users table created with ALL columns');
        });

        // Jobs table
        db.run(`CREATE TABLE jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            skills_required TEXT,
            location TEXT NOT NULL,
            wage REAL NOT NULL,
            employer_id INTEGER,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            views INTEGER DEFAULT 0,
            applications_count INTEGER DEFAULT 0
        )`, (err) => {
            if (err) console.error('❌ Jobs table error:', err);
            else console.log('✅ Jobs table created');
        });

        // Reviews table
        db.run(`CREATE TABLE reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER,
            to_user_id INTEGER,
            job_id INTEGER,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('❌ Reviews table error:', err);
            else console.log('✅ Reviews table created');
        });

        // Applications table
        db.run(`CREATE TABLE applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER,
            worker_id INTEGER,
            status TEXT DEFAULT 'pending',
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('❌ Applications table error:', err);
            else console.log('✅ Applications table created');
        });

        // User activities table
        db.run(`CREATE TABLE user_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            activity_type TEXT NOT NULL,
            description TEXT,
            target_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('❌ Activities table error:', err);
            else console.log('✅ Activities table created');
        });

        // Wait then insert sample data
        setTimeout(() => {
            insertSampleData();
        }, 1000);
    });
}

function insertSampleData() {
    console.log('📝 Inserting sample data...');
    
    // Sample users
    db.run(`INSERT INTO users (name, email, password, userType, phone, skills, rating, last_login) VALUES 
        ('Construction Company', 'employer@example.com', 'password', 'employer', '123-456-7890', 'construction,management', 4.5, datetime('now')),
        ('John Doe', 'worker@example.com', 'password', 'worker', '987-654-3210', 'construction,carpentry,plumbing', 4.2, datetime('now'))`, 
    (err) => {
        if (err) console.error('❌ Sample users error:', err);
        else console.log('✅ Sample users inserted');
    });

    // Sample jobs
    db.run(`INSERT INTO jobs (title, description, category, skills_required, location, wage, employer_id) VALUES 
        ('Construction Worker Needed', 'Help with building construction project', 'Construction', 'construction,carpentry', 'New York', 25, 1),
        ('House Cleaning', 'Weekly house cleaning service', 'Cleaning', 'cleaning,organization', 'Los Angeles', 20, 1),
        ('Plumbing Assistant', 'Help with plumbing installations', 'Plumbing', 'plumbing,construction', 'Chicago', 30, 1),
        ('Delivery Driver', 'Food delivery service', 'Delivery', 'driving,delivery', 'Miami', 18, 1)`, 
    (err) => {
        if (err) console.error('❌ Sample jobs error:', err);
        else console.log('✅ Sample jobs inserted');
    });

    // Sample reviews
    db.run(`INSERT INTO reviews (from_user_id, to_user_id, job_id, rating, comment) VALUES 
        (2, 1, 1, 5, 'Great employer! Paid on time and good working conditions.'),
        (1, 2, 1, 4, 'Hard worker and very skilled. Would hire again!')`, 
    (err) => {
        if (err) console.error('❌ Sample reviews error:', err);
        else console.log('✅ Sample reviews inserted');
    });

    console.log('🎉 Database setup COMPLETE!');
}

initializeDatabase();

module.exports = db;