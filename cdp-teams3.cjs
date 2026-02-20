const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

let id = 1;

ws.on('open', () => {
  // Scroll down more
  ws.send(JSON.stringify({
    id: id++,
    method: 'Runtime.evaluate',
    params: { expression: 'window.scrollTo(0, document.body.scrollHeight);' }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    // Double-click on Teams step
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: id++,
        method: 'Input.dispatchMouseEvent',
        params: { type: 'mousePressed', x: 760, y: 540, button: 'left', clickCount: 2 }
      }));
    }, 500);
  } else if (msg.id === 2) {
    ws.send(JSON.stringify({
      id: id++,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseReleased', x: 760, y: 540, button: 'left', clickCount: 2 }
    }));
  } else if (msg.id === 3) {
    console.log('Double-clicked Teams step');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 8000);
