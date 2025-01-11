const express = require('express');
const {createCanvas} = require('canvas');
const path = require('path');
var cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate the image
app.get('/image', (req, res) => {
    const { w, h, hex} = req.query;

    // Validate the hex color
    const color = `#${hex}`;
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return res.status(400).send('Invalid hex color');
    }

    // Determine width and height
    let width = parseInt(w, 10);
    let height = parseInt(h, 10);

    // If only one dimension is provided, use it for both
    if (!isNaN(width) && isNaN(height)) {
        height = width; // Set height to width if height is not provided
    } else if (isNaN(width) && !isNaN(height)) {
        width = height; // Set width to height if width is not provided
    } else if (isNaN(width) && isNaN(height)) {
        // If neither is provided, return an error
        return res.status(400).send('Width or height must be provided');
    }

    // Create a canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill the canvas with the specified color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Set the response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Send the image as a response
    return canvas.pngStream().pipe(res);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});