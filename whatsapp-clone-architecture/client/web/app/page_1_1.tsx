'use client';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [inCall, setInCall] = useState(false);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    const s = io('http://localhost:4000', { auth: { userId: 'user123' } });
    s.on('message:receive', (msg) => setMessages((m) => [...m, msg]));
    s.on('call:incoming', async ({ from, offer }) => {
      await startCall(false);
      await pc.current.setRemoteDescription(offer);
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      s.emit('call:answer', { to: from, answer });
    });
    s.on('call:answered', async ({ answer }) => {
      await pc.current.setRemoteDescription(answer);
    });
    s.on('call:ice-candidate', async ({ candidate }) => {
      await pc.current.addIceCandidate(candidate);
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

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

  const search = async (q) => {
    const res = await fetch(`http://localhost:4001/v1/search?q=${q}&userId=user123`);
    const results = await res.json();
    setMessages(results);
  };

  return (
    <div className="flex h-screen bg-[#111b21]">
      <div className="w-1/3 border-r border-gray-700 p-2">
        <input placeholder="Search messages..." onChange={e => search(e.target.value)} 
               className="w-full bg-[#2a3942] text-white p-2 rounded mb-2" />
        <button onClick={() => startCall(true)} className="w-full bg-[#00a884] p-2 rounded text-white">Video Call</button>
      </div>
      <div className="flex-1 flex flex-col">
        {inCall && (
          <div className="flex h-64 bg-black">
            <video ref={localVideo} autoPlay muted className="w-1/2" />
            <video ref={remoteVideo} autoPlay className="w-1/2" />
          </div>
        )}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m, i) => <div key={i} className="text-white">{m.from}: {m.text || m.message}</div>)}
        </div>
        <div className="p-4 bg-[#202c33] flex">
          <input className="flex-1 bg-[#2a3942] text-white p-2 rounded" 
                 value={input} onChange={e => setInput(e.target.value)} />
          <button onClick={() => socket?.emit('message:send', { to: 'user456', message: input, msgId: crypto.randomUUID() })} 
                  className="ml-2 bg-[#00a884] px-4 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
