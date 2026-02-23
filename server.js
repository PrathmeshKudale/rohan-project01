/* ==========================================
   BUILDSURGE IRRIGATION — BACKEND SERVER
   Saves inquiry form data to inquiries.json
   ========================================== */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'inquiries.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, style.css, script.js)
app.use(express.static(__dirname));

// ---------- Helper: Read existing inquiries ----------
function readInquiries() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading inquiries file:', err.message);
    }
    return [];
}

// ---------- Helper: Save inquiries ----------
function saveInquiries(inquiries) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
}

// ---------- API: Submit Inquiry ----------
app.post('/api/inquiry', (req, res) => {
    try {
        const { name, company, phone, email, pipeSize, quantity, message } = req.body;

        // Validation
        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone, and email are required.'
            });
        }

        // Create inquiry object
        const inquiry = {
            id: Date.now(),
            submittedAt: new Date().toISOString(),
            name: name.trim(),
            company: company ? company.trim() : '',
            phone: phone.trim(),
            email: email.trim(),
            pipeSize: pipeSize || '',
            quantity: quantity ? quantity.trim() : '',
            message: message ? message.trim() : '',
            status: 'new'
        };

        // Save to file
        const inquiries = readInquiries();
        inquiries.push(inquiry);
        saveInquiries(inquiries);

        console.log(`✅ New inquiry from: ${inquiry.name} (${inquiry.email})`);

        res.json({
            success: true,
            message: 'Inquiry submitted successfully!',
            inquiryId: inquiry.id
        });

    } catch (err) {
        console.error('❌ Error saving inquiry:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
});

// ---------- API: Delete Inquiry ----------
app.delete('/api/inquiry/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let inquiries = readInquiries();
        const before = inquiries.length;
        inquiries = inquiries.filter(inq => inq.id !== id);

        if (inquiries.length === before) {
            return res.status(404).json({ success: false, message: 'Inquiry not found.' });
        }

        saveInquiries(inquiries);
        console.log(`🗑️  Deleted inquiry #${id}`);
        res.json({ success: true, message: 'Inquiry deleted.' });
    } catch (err) {
        console.error('❌ Error deleting inquiry:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ---------- API: View All Inquiries (Admin) ----------
app.get('/api/inquiries', (req, res) => {
    const inquiries = readInquiries();
    res.json({
        success: true,
        total: inquiries.length,
        inquiries: inquiries.reverse() // newest first
    });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
    console.log('');
    console.log('===========================================');
    console.log('  Buildsurge Irrigation — Server Running');
    console.log('===========================================');
    console.log(`  🌐 Website:    http://localhost:${PORT}`);
    console.log(`  📋 Inquiries:  http://localhost:${PORT}/api/inquiries`);
    console.log('===========================================');
    console.log('');
});
