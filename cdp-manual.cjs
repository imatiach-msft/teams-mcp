const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Click on Manually radio button
      const radios = document.querySelectorAll('input[type="radio"], [role="radio"]');
      for (const radio of radios) {
        const label = radio.closest('label, div')?.textContent || '';
        if (label.includes('Manually')) {
          radio.click();
          break;
        }
      }
      
      // Also try clicking the label/text
      const labels = document.querySelectorAll('label, span, div');
      for (const label of labels) {
        if (label.textContent && label.textContent.trim() === 'Manually') {
          label.click();
          break;
        }
      }
      
      return 'Selected Manually';
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
