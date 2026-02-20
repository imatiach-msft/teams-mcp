const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find the element containing "HTTP POST URL" and get nearby input/text
      const labels = document.querySelectorAll('label, span, div');
      for (const label of labels) {
        if (label.textContent === 'HTTP POST URL') {
          // Get the parent row and find the value
          let parent = label.parentElement;
          for (let i = 0; i < 5; i++) {
            if (parent) {
              const inputs = parent.querySelectorAll('input, [role="textbox"], .ms-ComboBox-Input');
              for (const input of inputs) {
                if (input.value) return 'Input value: ' + input.value;
              }
              // Check text content
              const text = parent.textContent;
              if (text.includes('https://')) {
                const match = text.match(/https:\\/\\/[^\\s]+/);
                if (match) return 'Text match: ' + match[0];
              }
              parent = parent.parentElement;
            }
          }
        }
      }
      return 'Could not find URL field';
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
