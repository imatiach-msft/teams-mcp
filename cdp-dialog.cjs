const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find and click the "Overwrite" radio button
      const radios = document.querySelectorAll('input[type="radio"]');
      for (const radio of radios) {
        const label = radio.closest('div')?.textContent || '';
        if (label.includes('Overwrite')) {
          radio.click();
          break;
        }
      }
      
      // Also try by the choice container
      const choices = document.querySelectorAll('[role="radio"], .ms-ChoiceField');
      for (const choice of choices) {
        if (choice.textContent && choice.textContent.includes('Overwrite')) {
          choice.click();
          break;
        }
      }
      
      // Then click Apply button
      setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent && btn.textContent.trim() === 'Apply') {
            btn.click();
            return;
          }
        }
      }, 500);
      
      return 'Selected overwrite and clicking Apply';
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
