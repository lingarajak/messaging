const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

let worker, router;
const rooms = new Map(); // roomId -> { router, peers }

(async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
      { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
    ]
  });
})();

app.use(express.json());

// Create voice/video room
app.post('/v1/rooms/create', async (req, res) => {
  const { name, type, hostId } = req.body; // type: 'voice' or 'video'
  const roomId = uuidv4();
  await redis.hset(`room:${roomId}`, 'name', name, 'type', type, 'host', hostId, 'created', Date.now());
  rooms.set(roomId, { router, peers: new Map() });
  res.json({ roomId, link: `https://app.com/room/${roomId}` });
});

io.on('connection', (socket) => {
  socket.on('room:join', async ({ roomId, userId }) => {
    socket.join(roomId);
    const room = rooms.get(roomId);
    if (!room) return;
    
    // Create WebRTC transport for this peer
    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.ANNOUNCED_IP || '127.0.0.1' }],
      enableUdp: true,
      enableTcp: true
    });
    
    room.peers.set(userId, { socket, transport, producers: [], consumers: [] });
    socket.emit('room:joined', { 
      rtpCapabilities: room.router.rtpCapabilities,
      transportOptions: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      }
    });
    
    // Notify others
    socket.to(roomId).emit('peer:joined', { userId });
  });

  socket.on('room:produce', async ({ roomId, userId, kind, rtpParameters, isScreen }) => {
    const room = rooms.get(roomId);
    const peer = room.peers.get(userId);
    const producer = await peer.transport.produce({ kind, rtpParameters, appData: { isScreen } });
    peer.producers.push(producer);
    
    // Notify all other peers to consume
    socket.to(roomId).emit('peer:produced', { userId, producerId: producer.id, kind, isScreen });
  });

  socket.on('room:consume', async ({ roomId, userId, producerId }) => {
    const room = rooms.get(roomId);
    const peer = room.peers.get(userId);
    const consumer = await peer.transport.consume({
      producerId,
      rtpCapabilities: room.router.rtpCapabilities
    });
    peer.consumers.push(consumer);
    socket.emit('room:consumed', {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters
    });
  });
});

server.listen(4007, () => console.log('Rooms service on :4007'));
