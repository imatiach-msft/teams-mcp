const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/9A5DE3E0737E3D25FDE015AD0A2905DC');

ws.on('open', () => {
  const jsCode = `
    (function() {
      // Find all card containers
      const cards = document.querySelectorAll('[class*="msla-card-container"], [class*="msla-panel-card"]');
      let teamsCard = null;
      
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('Post message in a chat or channel')) {
          teamsCard = card;
          break;
        }
      }
      
      if (teamsCard) {
        // Check if it has a collapsed state we can toggle
        const expandButton = teamsCard.querySelector('[class*="expand"], [class*="collapse"], [class*="chevron"], button[aria-expanded]');
        if (expandButton) {
          expandButton.click();
          return 'Clicked expand button';
        }
        
        // Look for the card v2 header to click
        const v2Header = teamsCard.querySelector('[class*="msla-panel-card-header"]');
        if (v2Header) {
          // Simulate double-click
          v2Header.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
          return 'Double-clicked panel header';
        }
        
        return 'Card found but no expand mechanism found';
      }
      return 'Teams card not found';
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
