const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find the HTTP POST URL label and look for nearby clickable elements
      const allElements = document.querySelectorAll('*');
      let urlContainer = null;
      
      for (const el of allElements) {
        if (el.innerText && el.innerText.includes('HTTP POST URL') && el.innerText.length < 50) {
          urlContainer = el.parentElement;
          break;
        }
      }
      
      if (urlContainer) {
        // Find buttons or clickable elements within/near this container
        const buttons = urlContainer.querySelectorAll('button, [role="button"], i, svg');
        const results = [];
        for (const btn of buttons) {
          results.push({
            tag: btn.tagName,
            class: btn.className,
            ariaLabel: btn.getAttribute('aria-label'),
            title: btn.getAttribute('title')
          });
        }
        return JSON.stringify({ found: true, buttons: results, containerHTML: urlContainer.innerHTML.substring(0, 500) });
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
    console.log(msg.result?.result?.value || JSON.stringify(msg.result));
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
