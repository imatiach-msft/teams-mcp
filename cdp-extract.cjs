const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      const inputs = document.querySelectorAll('input');
      for (const input of inputs) {
        if (input.value && input.value.includes('powerplatform') && input.value.includes('sig=')) {
          return input.value;
        }
      }
      return 'URL not found in inputs';
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
    if (msg.result && msg.result.result) {
      console.log('URL:', msg.result.result.value);
    } else {
      console.log('Result:', JSON.stringify(msg, null, 2));
    }
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
