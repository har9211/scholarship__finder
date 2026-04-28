const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "supersecretkey"; // From security.py
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123";

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database
let scholarships = [
    {
        id: 'sch1',
        name: 'Merit Excellence Grant',
        amount: 50000,
        minMarks: 85,
        incomeMax: 500000,
        level: 'Undergraduate',
        state: 'Any',
        deadline: '2026-07-10',
        description: 'A prestigious grant to support exceptionally talented undergraduate students in pursuing their degrees without financial burden. Includes mentorship opportunities.',
        documents: ['10th Marksheet', '12th Marksheet', 'Income Certificate', 'Passport Size Photo'],
        category: 'Any',
        type: 'Merit-based'
    },
    {
        id: 'sch2',
        name: 'Rural Student Aid',
        amount: 30000,
        minMarks: 60,
        incomeMax: 300000,
        level: 'Any',
        state: 'Rural',
        deadline: '2026-08-01',
        description: 'Dedicated financial support program aiming to empower students from rural backgrounds to access quality education.',
        documents: ['Domicile Certificate', 'Income Certificate', 'Previous Year Marksheet'],
        category: 'Any',
        type: 'Need-based'
    },
    {
        id: 'sch3',
        name: 'Women in Tech Scholarship',
        amount: 75000,
        minMarks: 75,
        incomeMax: 800000,
        level: 'Undergraduate',
        state: 'Any',
        deadline: '2026-06-15',
        description: 'Empowering future female leaders in technology through financial aid and exclusive networking events with industry professionals.',
        documents: ['12th Marksheet', 'College ID', 'Essay on Tech Innovation'],
        category: 'Female',
        type: 'Diversity'
    },
    {
        id: 'sch4',
        name: 'Postgraduate Research Fellowship',
        amount: 100000,
        minMarks: 70,
        incomeMax: 1000000,
        level: 'Postgraduate',
        state: 'Any',
        deadline: '2026-09-30',
        description: 'Funding for promising postgraduate students engaging in innovative research projects that benefit society.',
        documents: ['Graduation Degree', 'Research Proposal', 'Recommendation Letters'],
        category: 'Any',
        type: 'Research'
    },
    {
        id: 'sch5',
        name: 'Minority Upliftment Program',
        amount: 40000,
        minMarks: 50,
        incomeMax: 250000,
        level: 'Any',
        state: 'Any',
        deadline: '2026-10-20',
        description: 'Support designed for students from minority communities to ensure equitable access to higher education opportunities.',
        documents: ['Caste/Category Certificate', 'Income Certificate', 'Aadhar Card'],
        category: 'Minority',
        type: 'Need-based'
    }
];

// In-memory data for users/saved items (mocking DB)
let savedScholarships = {}; // e.g. { 'user123': ['sch1', 'sch3'] }

// --- API Endpoints ---

// Admin Login Route
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generating a token as done in create_token
        const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ access_token: token, token_type: 'bearer' });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// 1. Get all scholarships (Admin mostly)
app.get('/api/scholarships', (req, res) => {
    res.json(scholarships);
});

// 2. Get single scholarship details
app.get('/api/scholarships/:id', (req, res) => {
    const scholarship = scholarships.find(s => s.id === req.params.id);
    if (scholarship) {
        res.json(scholarship);
    } else {
        res.status(404).json({ error: 'Scholarship not found' });
    }
});

// 3. Match Profile to Scholarships
app.post('/api/match', (req, res) => {
    const profile = req.body;
    /* Expected profile structure:
      {
        name: 'John', age: 20, state: 'Delhi', income: 400000, 
        gender: 'Male', category: 'General', level: 'Undergraduate',
        marks: 80, interests: 'Tech'
      }
    */
    
    let matched = scholarships.filter(sch => {
        let isMatch = true;
        let reasons = [];
        
        // Match Marks
        if (sch.minMarks && profile.marks < sch.minMarks) {
            isMatch = false;
        } else if (sch.minMarks) {
            reasons.push(`Meets minimum marks of ${sch.minMarks}%`);
        }
        
        // Match Income
        if (sch.incomeMax && profile.income > sch.incomeMax) {
            isMatch = false;
        } else if (sch.incomeMax) {
            reasons.push(`Meets income criteria (<= ₹${sch.incomeMax.toLocaleString()})`);
        }
        
        // Match Education Level
        if (sch.level !== 'Any' && sch.level !== profile.level) {
            isMatch = false;
        } else if (sch.level !== 'Any') {
            reasons.push(`Matches Education Level (${sch.level})`);
        }
        
        // Match Category/Gender (simplified)
        if (sch.category === 'Female' && profile.gender !== 'Female') {
            isMatch = false;
        } else if (sch.category === 'Female') {
            reasons.push(`Diversity grant match`);
        }

        if (sch.state === 'Rural' && profile.state !== 'Rural') {
            // Simplified logic: assume profile.state holds 'Rural' or 'Urban' for demo
            // In a real app, 'Rural' would be a separate boolean flag
        }

        if (isMatch) {
            // Clone the object to add matchReasons without mutating the DB
            sch.matchReasons = reasons;
        }
        return isMatch;
    });

    // Ranking algorithm
    matched.sort((a, b) => {
        // 1. Sort by Highest Amount
        if (b.amount !== a.amount) return b.amount - a.amount;
        // 2. Sort by Nearest Deadline
        return new Date(a.deadline) - new Date(b.deadline);
    });

    // Mock returning a user ID for session tracking in frontend
    res.json({
        userId: 'demo-user-123',
        matches: matched
    });
});

// 4. Save Scholarship
app.post('/api/save', (req, res) => {
    const { userId, scholarshipId } = req.body;
    if (!savedScholarships[userId]) savedScholarships[userId] = [];
    
    if (!savedScholarships[userId].includes(scholarshipId)) {
        savedScholarships[userId].push(scholarshipId);
    }
    
    res.json({ success: true, saved: savedScholarships[userId] });
});

// 5. Get Saved Scholarships
app.get('/api/saved/:userId', (req, res) => {
    const userId = req.params.userId;
    const savedIds = savedScholarships[userId] || [];
    const savedList = scholarships.filter(s => savedIds.includes(s.id));
    res.json(savedList);
});

// Admin Add Scholarship
app.post('/api/scholarships', authenticateToken, (req, res) => {
    const newSch = req.body;
    newSch.id = 'sch' + (scholarships.length + 1);
    scholarships.push(newSch);
    res.json({ success: true, scholarship: newSch });
});

// Admin Delete Scholarship
app.delete('/api/scholarships/:id', authenticateToken, (req, res) => {
    scholarships = scholarships.filter(s => s.id !== req.params.id);
    res.json({ success: true });
});

// Fallback to index.html for unknown routes (SPA-like feel if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
