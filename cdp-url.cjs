const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find all text that looks like a Power Automate URL with sig
      const allText = document.body.innerHTML;
      
      // Look for the URL pattern
      const patterns = [
        /https:\/\/[^"'<>\\s]*powerplatform\\.com[^"'<>\\s]*sig=[^"'<>\\s]*/g,
        /https:\/\/[^"'<>\\s]*environment\\.api\\.powerplatform[^"'<>\\s]*/g
      ];
      
      for (const pattern of patterns) {
        const matches = allText.match(pattern);
        if (matches && matches.length > 0) {
          return matches[0];
        }
      }
      
      // Also check all input values
      const inputs = document.querySelectorAll('input, [contenteditable="true"]');
      for (const input of inputs) {
        const val = input.value || input.textContent || '';
        if (val.includes('powerplatform') || val.includes('sig=')) {
          return 'Input value: ' + val;
        }
      }
      
      return 'URL not found in page HTML';
    })();
  `;
  
  ws.send(JSON.stringify({ 
    id: 1, 
    method: 'Runtime.evaluate', 
    params: { expression: jsCode, returnByValue: true } 
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    console.log(msg.result?.result?.value);
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
