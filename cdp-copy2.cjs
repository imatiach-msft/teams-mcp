const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (async function() {
      const copyBtn = document.querySelector('[aria-label="Copy Url"]');
      if (copyBtn) {
        copyBtn.click();
        // Wait a moment for clipboard to update
        await new Promise(r => setTimeout(r, 500));
        try {
          const text = await navigator.clipboard.readText();
          return 'Clipboard: ' + text;
        } catch (e) {
          return 'Clicked but clipboard read failed: ' + e.message;
        }
      }
      return 'Copy button not found';
    })();
  `;
  
  ws.send(JSON.stringify({ 
    id: 1, 
    method: 'Runtime.evaluate', 
    params: { expression: jsCode, returnByValue: true, awaitPromise: true } 
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    console.log(msg.result?.result?.value || JSON.stringify(msg.result));
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 8000);
