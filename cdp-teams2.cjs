const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

let id = 1;

ws.on('open', () => {
  // First scroll down
  ws.send(JSON.stringify({
    id: id++,
    method: 'Runtime.evaluate',
    params: { expression: 'window.scrollBy(0, 200);' }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    // Wait a moment then click on Teams step (around y=540 based on screenshot)
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: id++,
        method: 'Input.dispatchMouseEvent',
        params: { type: 'mousePressed', x: 870, y: 540, button: 'left', clickCount: 1 }
      }));
    }, 500);
  } else if (msg.id === 2) {
    ws.send(JSON.stringify({
      id: id++,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseReleased', x: 870, y: 540, button: 'left', clickCount: 1 }
    }));
  } else if (msg.id === 3) {
    console.log('Clicked Teams step');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 8000);
