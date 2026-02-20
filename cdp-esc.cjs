const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

let id = 1;

ws.on('open', () => {
  // Press Escape key to close menu
  ws.send(JSON.stringify({
    id: id++,
    method: 'Input.dispatchKeyEvent',
    params: { type: 'keyDown', key: 'Escape', code: 'Escape' }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    ws.send(JSON.stringify({
      id: id++,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyUp', key: 'Escape', code: 'Escape' }
    }));
  } else if (msg.id === 2) {
    console.log('Pressed Escape');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
