const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find all elements and look for the Teams step
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const text = el.textContent || '';
        const className = el.className || '';
        
        // Look for the card header that contains "Post message"
        if (text.includes('Post message in a chat or channel') && 
            (className.includes('card') || className.includes('header') || className.includes('node'))) {
          
          // Try to find a clickable parent or the element itself
          const clickTarget = el.closest('[class*="card"]') || el.closest('[class*="node"]') || el;
          
          // Get its bounding rect
          const rect = clickTarget.getBoundingClientRect();
          return JSON.stringify({
            found: true,
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
            width: rect.width,
            height: rect.height,
            className: clickTarget.className
          });
        }
      }
      return JSON.stringify({ found: false });
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
