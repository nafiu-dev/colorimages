const express = require('express');
const { createCanvas } = require('canvas');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());

// Rate limiter middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter); // Apply to all routes

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Generate the image
app.get('/image', (req, res) => {
    const { w, h, hex } = req.query;

    // Validate the hex color
    const color = `#${hex}`;
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return res.status(400).json({ error: 'Invalid hex color' });
    }

    // Parse and validate dimensions
    let width = parseInt(w, 10);
    let height = parseInt(h, 10);

    if ((isNaN(width) || width <= 0) && (isNaN(height) || height <= 0)) {
        return res.status(400).json({ error: 'Width or height must be a positive number' });
    }
    if (!isNaN(width) && isNaN(height)) {
        height = width;
    } else if (isNaN(width) && !isNaN(height)) {
        width = height;
    }

    // Limit maximum dimensions
    if (width > 1000 || height > 1000) {
        return res.status(400).json({ error: 'Width and height must not exceed 1000' });
    }

    // Create a canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return canvas.pngStream().pipe(res);
});



// Start the server
module.exports = app;

// const PORT = 3000
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });