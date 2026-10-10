const fs = require('fs');
const html = fs.readFileSync('c:/Users/Acer/Downloads/money kepper/share.html', 'utf8');

const calls = html.split('AF_initDataCallback(');
console.log('Total callbacks:', calls.length - 1);

calls.slice(1).forEach((c, idx) => {
  const preview = c.slice(0, 300);
  console.log(`Callback ${idx}:`, preview);
  
  // check if has image or content
  if (c.includes('lh3.googleusercontent.com') || c.includes('generativelanguage') || c.includes('image') || c.includes('video')) {
    console.log(`Callback ${idx} has media!`);
    const urls = c.match(/https:\/\/[^"'\s\\]+/g) || [];
    console.log('URLs:', [...new Set(urls)].filter(u => !u.includes('gstatic.com')));
  }
});
