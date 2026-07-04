// Rooms Service - V10.7 Updated
const express = require('express');
const app = express();
const { Server } = require('socket.io');
const io = new Server(4010, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('room:join', ({ roomId, userId }) => {
    socket.join(roomId);
  });

  // V10.7: Audio chunk with translation
  socket.on('audio:chunk', async ({ roomId, chunk, speakerLang, userLang }) => {
    // 1. Transcribe via AWS Transcribe (existing)
    const text = 'transcribed text'; // placeholder
    
    // 2. V10.7: Translate if needed
    if (speakerLang !== userLang) {
      const translated = await fetch('http://translate-service:4011/v1/calls/' + roomId + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: speakerLang, to: userLang })
      }).then(r => r.json());
      
      socket.emit('caption:translated', { original: text, translated: translated.translated });
    } else {
      socket.emit('caption', { text });
    }
  });
});

console.log('rooms-service :4010');