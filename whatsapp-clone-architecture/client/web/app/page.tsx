'use client';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [inCall, setInCall] = useState(false);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [activeFolder, setActiveFolder] = useState('all');
  const [recording, setRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState(0);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const s = io('http://localhost:4000', { auth: { userId: 'user123' } });
    s.on('message:receive', (msg) => setMessages((m) => [...m, msg]));
    s.on('reaction:update', ({ msgId, reactions }) => {
      setMessages(m => m.map(msg => msg.msgId === msgId ? {...msg, reactions} : msg));
    });
    s.on('call:incoming', async ({ from, offer }) => {
      await startCall(false);
      await pc.current.setRemoteDescription(offer);
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      s.emit('call:answer', { to: from, answer });
    });
    s.on('call:answered', async ({ answer }) => await pc.current.setRemoteDescription(answer));
    s.on('call:ice-candidate', async ({ candidate }) => await pc.current.addIceCandidate(candidate));
    setSocket(s);
    fetchStories();
    return () => s.disconnect();
  }, []);

  const fetchStories = async () => {
    const res = await fetch('http://localhost:4002/v1/status/feed/user123');
    setStories(await res.json());
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const url = await uploadMedia(blob, 'voice.webm', 'audio/webm');
      socket.emit('message:send', { to: 'user456', type: 'voice', mediaKey: url, msgId: crypto.randomUUID() });
    };
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };

  const uploadMedia = async (blob, filename, type) => {
    const res = await fetch('http://localhost:4000/v1/media/upload-url', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ filename, contentType: type })
    });
    const { url, key } = await res.json();
    await fetch(url, { method: 'PUT', body: blob });
    return key;
  };

  const editMessage = (msgId) => {
    const newText = prompt('Edit message:');
    if (newText) socket.emit('message:edit', { msgId, newText, userId: 'user123' });
  };
  const deleteMessage = (msgId) => {
    if (confirm('Delete for everyone?')) socket.emit('message:delete', { msgId, userId: 'user123', deleteForEveryone: true });
  };
  const pinMessage = (msgId) => {
    socket.emit('message:pin', { chatId: 'user456', msgId, userId: 'user123', isGroup: false });
  };
  const forwardMessage = (msgId) => {
    const to = prompt('Forward to userId:');
    if (to) socket.emit('message:forward', { msgId, to, userId: 'user123' });
  };
  const scheduleMessage = () => {
    const time = prompt('Send at (YYYY-MM-DD HH:MM):');
    const text = prompt('Message:');
    if (time && text) {
      fetch('http://localhost:4003/v1/schedule', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ to: 'user456', message: text, sendAt: time, userId: 'user123' })
      });
    }
  };
  const startPayment = async () => {
    const amount = prompt('Amount to send:');
    if (!amount) return;
    const res = await fetch('http://localhost:4005/v1/payments/create', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ amount: parseFloat(amount), from: 'user123', to: 'user456', message: 'Payment' })
    });
    const { clientSecret } = await res.json();
    alert('Payment intent created. Integrate Stripe Elements here.');
  };
  const toggleLocation = () => {
    if (!sharingLocation) {
      navigator.geolocation.watchPosition(pos => {
        socket.emit('location:update', { userId: 'user123', chatId: 'user456', lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
      setSharingLocation(true);
    } else {
      socket.emit('location:stop', { userId: 'user123', chatId: 'user456' });
      setSharingLocation(false);
    }
  };
  const createPoll = () => {
    const q = prompt('Poll question:');
    const opts = prompt('Options comma-separated:')?.split(',');
    const isQuiz = confirm('Is this a quiz?');
    let correctAnswer = null;
    if (isQuiz) correctAnswer = prompt('Correct option index (0,1,2...):');
    if (q && opts) socket.emit('poll:create', { question: q, options: opts, chatId: 'user456', isQuiz, correctAnswer });
  };
  const openCatalog = () => {
    window.open('http://localhost:4009/v1/catalog/business123', '_blank');
  };
  const summarizeChat = () => {
    socket.emit('ai:summarize', { chatId: 'user456' });
  };
  const setDisappearing = () => {
    const timer = prompt('Disappearing timer: 0=off, 86400=24h, 604800=7d');
    if (timer) socket.emit('chat:disappearing', { chatId: 'user456', timer: parseInt(timer), userId: 'user123' });
  };
  const createChannel = () => {
    const name = prompt('Channel name:');
    if (name) socket.emit('channel:create', { name, description: '', isPublic: true, creatorId: 'user123' });
  };
  const addReaction = (msgId, emoji) => {
    socket.emit('reaction:add', { msgId, emoji, userId: 'user123' });
  };

  const startCall = async (isCaller = true) => {
    setInCall(true);
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.current.ontrack = (e) => { remoteVideo.current.srcObject = e.streams[0]; };
    pc.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit('call:ice-candidate', { to: 'user456', candidate: e.candidate });
    };
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;
    stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
    if (isCaller) {
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit('call:user', { to: 'user456', offer });
    }
  };

  return (
    <div className="flex h-screen bg-tg-bg text-tg-text">
      <div className="w-20 bg-tg-sidebar border-r border-gray-800 flex flex-col items-center py-4">
        <button onClick={() => setActiveTab('chats')} className={activeTab==='chats'?'text-tg-accent':'text-tg-secondary'}>💬</button>
        <button onClick={() => setActiveTab('status')} className={activeTab==='status'?'text-tg-accent':'text-tg-secondary'}>⭕</button>
        <button onClick={() => setActiveTab('calls')} className={activeTab==='calls'?'text-tg-accent':'text-tg-secondary'}>📞</button>
        <button onClick={createChannel} className={'text-tg-secondary'}>📢</button>
      </div>
      <div className="w-80 bg-tg-sidebar border-r border-gray-800">
        <div className="p-2 border-b border-gray-800">
          <div className="flex space-x-2 mb-2">
            {['all','personal','groups','unread'].map(f => (
              <button key={f} onClick={()=>setActiveFolder(f)} 
                      className={`px-3 py-1 rounded-full text-sm ${activeFolder===f?'bg-tg-accent':'bg-tg-chat'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {activeTab==='status' && (
          <div className="p-4">
            <h3 className="font-bold mb-2">Status</h3>
            {stories.map(s => <div key={s.statusId} className="mb-2 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-0.5 mr-2">
                <div className="w-full h-full rounded-full bg-tg-sidebar"></div>
              </div>
              {s.userId}
            </div>)}
          </div>
        )}
        {activeTab==='chats' && <div className="p-4">Chat List</div>}
      </div>
      <div className="flex-1 flex flex-col bg-tg-chat">
        {inCall && (
          <div className="flex h-64 bg-black">
            <video ref={localVideo} autoPlay muted className="w-1/2" />
            <video ref={remoteVideo} autoPlay className="w-1/2" />
          </div>
        )}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="mb-4 group">
              {m.replyTo && <div className="text-xs text-tg-secondary border-l-2 border-tg-accent pl-2 mb-1">Replying to: {m.replyTo}</div>}
              <div className="flex items-end">
                <div className="bg-tg-bubble-in inline-block p-2 rounded-lg max-w-md">
                  {m.type==='voice' ? (
                    <audio controls src={`http://localhost:9000/whatsapp-media/${m.mediaKey}`} className="w-48" />
                  ) : (
                    <span>{m.text || m.message}</span>
                  )}
                  <div className="flex mt-1 space-x-1">
                    {m.reactions && Object.entries(m.reactions).map(([emoji, users]) => (
                      <span key={emoji} className="bg-tg-bg px-1 rounded text-xs">{emoji} {users.length}</span>
                    ))}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 ml-2 flex space-x-1">
                  <button onClick={() => setReplyingTo(m.msgId)}>↩️</button>
                  <button onClick={() => addReaction(m.msgId, '👍')}>👍</button>
                  <button onClick={() => addReaction(m.msgId, '❤️')}>❤️</button>
                  <button onClick={() => addReaction(m.msgId, '😂')}>😂</button>
                  <button onClick={() => editMessage(m.msgId)}>✏️</button>
                  <button onClick={() => deleteMessage(m.msgId)}>🗑️</button>
                  <button onClick={() => pinMessage(m.msgId)}>📌</button>
                  <button onClick={() => forwardMessage(m.msgId)}>➡️</button>
                  <button onClick={() => scheduleMessage()}>⏰</button>
                  <button onClick={() => startPayment()}>💳</button>
                  <button onClick={() => toggleLocation()}>📍</button>
                  <button onClick={() => setDisappearing()}>⏱️</button>
                  <button onClick={() => createPoll()}>📊</button>
                  <button onClick={() => openCatalog()}>🛒</button>
                  <button onClick={() => summarizeChat()}>🤖</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-tg-sidebar">
          {replyingTo && <div className="text-xs text-tg-secondary mb-1">Replying to message <button onClick={()=>setReplyingTo(null)}>✕</button></div>}
          <div className="flex">
            <input className="flex-1 bg-tg-chat text-tg-text p-2 rounded-l" 
                   value={input} onChange={e => setInput(e.target.value)} placeholder="Write a message..." />
            <button onClick={recording ? stopRecording : startRecording} 
                    className={`px-3 ${recording?'bg-red-500':'bg-tg-accent'}`}>🎤</button>
            <button onClick={() => {
              socket?.emit('message:send', { to: 'user456', message: input, msgId: crypto.randomUUID(), replyTo: replyingTo });
              setInput(''); setReplyingTo(null);
            }} className="bg-tg-accent px-4 rounded-r">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
