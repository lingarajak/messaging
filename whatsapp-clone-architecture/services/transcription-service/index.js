// Transcription Service - V10.4
const express = require('express');
const app = express();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4024 });

wss.on('connection', (ws) => {
  // AWS Transcribe Streaming WebSocket
  ws.on('message', (audioChunk) => {
    // Send to AWS Transcribe, stream back text
    ws.send(JSON.stringify({ transcript: 'Live text...', isFinal: false }));
  });
});
console.log('transcription-service :4024 WebSocket');