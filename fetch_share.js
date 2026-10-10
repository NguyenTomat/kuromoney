const fs = require('fs');
const https = require('https');

// Fetch the share URL with proper headers
const url = 'https://gemini.google.com/share/2f57621cc72b';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find all WIZ / AF_initDataCallback containing user conversation
    const match = data.match(/AF_initDataCallback\(\{key: 'ds:1'.*?data:(.*?)\}\);/s) ||
                  data.match(/AF_initDataCallback\(\{key: 'ds:2'.*?data:(.*?)\}\);/s) ||
                  data.match(/AF_initDataCallback\(\{key: 'ds:0'.*?data:(.*?)\}\);/s);
    
    // Search for images generated or prompts
    const imgUrls = data.match(/https:\/\/[^"'\s\\]*(?:googleusercontent|bard|lh3)[^"'\s\\]*/g) || [];
    console.log('Image URLs found:', [...new Set(imgUrls)]);

    // Save full HTML to inspect if needed
    fs.writeFileSync('c:/Users/Acer/Downloads/money kepper/share_dump.html', data);
    console.log('Saved share_dump.html, size:', data.length);
  });
});
