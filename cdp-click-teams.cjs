const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

let messageId = 1;

ws.on('open', async () => {
  // First scroll down to make sure Teams step is visible
  ws.send(JSON.stringify({
    id: messageId++,
    method: 'Runtime.evaluate',
    params: { expression: 'window.scrollBy(0, 300);' }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  
  if (msg.id === 1) {
    // Now click on the Teams step - it should be around y=565 based on screenshot
    // Click in the center of the "Post message in a chat or channel" bar
    ws.send(JSON.stringify({
      id: messageId++,
      method: 'Input.dispatchMouseEvent',
      params: {
        type: 'mousePressed',
        x: 870,
        y: 565,
        button: 'left',
        clickCount: 1
      }
    }));
  } else if (msg.id === 2) {
    ws.send(JSON.stringify({
      id: messageId++,
      method: 'Input.dispatchMouseEvent',
      params: {
        type: 'mouseReleased',
        x: 870,
        y: 565,
        button: 'left',
        clickCount: 1
      }
    }));
  } else if (msg.id === 3) {
    console.log('Clicked on Teams step');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => process.exit(1), 5000);
