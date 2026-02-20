const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

let id = 1;

ws.on('open', () => {
  // Click on Teams step - based on screenshot it's around y=540
  ws.send(JSON.stringify({
    id: id++,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mousePressed', x: 760, y: 540, button: 'left', clickCount: 1 }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    ws.send(JSON.stringify({
      id: id++,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseReleased', x: 760, y: 540, button: 'left', clickCount: 1 }
    }));
  } else if (msg.id === 2) {
    console.log('Clicked Teams');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
