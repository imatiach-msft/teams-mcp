const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find the Teams step header/card and click it
      const cards = document.querySelectorAll('[class*="msla-panel-card"], [class*="operation-node"], [class*="card-v2"]');
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('Post message in a chat or channel')) {
          // Find clickable header inside
          const header = card.querySelector('[class*="header"], [class*="title"], button') || card;
          header.click();
          return 'Clicked Teams card';
        }
      }
      // Try the collapsed card header
      const headers = document.querySelectorAll('[class*="msla-content-header"]');
      for (const h of headers) {
        if (h.textContent && h.textContent.includes('Post message')) {
          h.click();
          return 'Clicked header';
        }
      }
      return 'Could not find Teams step to click';
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
