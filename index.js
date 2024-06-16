// index.js

// Import necessary modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory database for storing shortened URLs
let urlDatabase = [];
let idCounter = 1;

// Function to validate URL format
function isValidUrl(url) {
  // Regular expression to check for a valid URL format
  const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;
  
  // Test the input against the regex
  return urlRegex.test(url);
}

// Routes
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to handle URL shortening
app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;

  // Validate URL format
  if (!isValidUrl(url)) {
    res.json({ error: 'invalid url' });
    return;
  }

  // Check if URL is reachable
  const urlObj = new URL(url);
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      // Generate short URL and store in database
      const shortUrlEntry = {
        original_url: url,
        short_url: idCounter++
      };
      urlDatabase.push(shortUrlEntry);

      // Respond with JSON containing original and short URL
      res.json(shortUrlEntry);
    }
  });
});

// API endpoint to redirect to original URL based on short URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const { short_url } = req.params;
  const entry = urlDatabase.find(item => item.short_url === parseInt(short_url));

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'invalid short url' });
  }
});

// Listen on port
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
