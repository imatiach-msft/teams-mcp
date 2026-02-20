const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find the Teams step header specifically
      const headers = document.querySelectorAll('[class*="msla-panel-card-header"], [class*="card-header"], [class*="operation-header"]');
      for (const h of headers) {
        if (h.textContent && h.textContent.includes('Post message')) {
          h.click();
          return 'Clicked header: ' + h.className;
        }
      }
      
      // Try finding the collapsed card container and clicking it
      const cards = document.querySelectorAll('[class*="msla-card-container"]');
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('Post message')) {
          // Find header inside
          const header = card.querySelector('[class*="header"]');
          if (header) {
            header.click();
            return 'Clicked inner header';
          }
          card.click();
          return 'Clicked card container';
        }
      }
      
      return 'Not found';
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
