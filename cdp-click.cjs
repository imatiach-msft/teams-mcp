const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  // Find and click the copy button, then read clipboard
  const jsCode = `
    (function() {
      // Look for all buttons with copy/clipboard icons
      const buttons = document.querySelectorAll('button, [role="button"], [data-icon-name*="Copy"], [aria-label*="Copy"], [aria-label*="copy"]');
      for (const btn of buttons) {
        const label = btn.getAttribute('aria-label') || btn.innerText || '';
        if (label.toLowerCase().includes('copy')) {
          btn.click();
          return 'Clicked copy button: ' + label;
        }
      }
      // Try finding by class or icon
      const copyIcons = document.querySelectorAll('[class*="copy"], [class*="Copy"], svg[data-icon-name*="Copy"]');
      if (copyIcons.length > 0) {
        const parent = copyIcons[0].closest('button') || copyIcons[0].parentElement;
        if (parent) {
          parent.click();
          return 'Clicked icon parent';
        }
      }
      return 'Copy button not found. Buttons: ' + buttons.length;
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
    console.log('Result:', msg.result?.result?.value || JSON.stringify(msg.result));
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
