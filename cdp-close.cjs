const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Click X button to close
      const closeButtons = document.querySelectorAll('[aria-label="Close"], [aria-label="close"], button');
      for (const btn of closeButtons) {
        const label = btn.getAttribute('aria-label') || '';
        if (label.toLowerCase() === 'close' || btn.textContent === '×') {
          btn.click();
          return 'Clicked close';
        }
      }
      // Try clicking escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }));
      return 'Sent Escape key';
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
