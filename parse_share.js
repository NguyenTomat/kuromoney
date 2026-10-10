const fs = require('fs');
const content = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/c0f877a0-8018-48fc-9ad5-e8426fa37547/.system_generated/steps/60/content.md', 'utf8');

// Find all occurrences of "https://lh3.googleusercontent.com" or image files
const urlRegex = /https:\/\/[^\s"'\\]+/g;
const urls = content.match(urlRegex) || [];
const uniqueUrls = [...new Set(urls)].filter(u => u.includes('googleusercontent') || u.match(/\.(png|jpg|gif|webp|mp4)/i));
console.log('Unique media URLs:', uniqueUrls);

// Search for Vietnamese text or conversation text
const vietnameseMatches = content.match(/[\p{L}\s]{10,100}/gu) || [];
console.log('Sample text snippets:');
const sample = vietnameseMatches.filter(t => t.toLowerCase().includes('kuromi') || t.toLowerCase().includes('con') || t.toLowerCase().includes('nền') || t.toLowerCase().includes('ảnh') || t.toLowerCase().includes('gif') || t.toLowerCase().includes('video'));
console.log(sample.slice(0, 10));
