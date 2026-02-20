const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find Save button
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent || btn.innerText || '';
        if (text.trim() === 'Save') {
          btn.click();
          return 'Clicked Save button';
        }
      }
      // Try aria-label
      const saveBtn = document.querySelector('[aria-label="Save"]');
      if (saveBtn) {
        saveBtn.click();
        return 'Clicked Save (aria-label)';
      }
      return 'Save button not found';
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
