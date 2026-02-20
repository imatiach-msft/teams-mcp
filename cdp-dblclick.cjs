const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find the span containing "Post message in a chat or channel"
      const spans = document.querySelectorAll('span, div, p');
      for (const span of spans) {
        if (span.textContent && span.textContent.trim() === 'Post message in a chat or channel') {
          span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
          return 'Double-clicked Teams title';
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
