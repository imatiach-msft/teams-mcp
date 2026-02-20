const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  ws.send(JSON.stringify({ id: 1, method: 'Page.captureScreenshot', params: { format: 'png' } }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1 && msg.result && msg.result.data) {
    fs.writeFileSync('screenshot.png', Buffer.from(msg.result.data, 'base64'));
    console.log('Screenshot saved!');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => { console.error('Error:', err.message); process.exit(1); });
setTimeout(() => { console.log('Timeout'); process.exit(1); }, 5000);
