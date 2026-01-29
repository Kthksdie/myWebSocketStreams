const { WebSocketServer } = require('ws');
const { createWebSocketStream } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server started on port 8080');

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Create a duplex stream from the WebSocket
  const duplex = createWebSocketStream(ws, { encoding: 'utf8' });

  // Example: Echo functionality using streams
  // Pipe the stream back to itself (echo)
  // In a real app, we would process the chunks
  duplex.pipe(duplex);

  duplex.on('error', console.error);
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
