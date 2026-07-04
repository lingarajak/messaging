import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import io from 'socket.io-client';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const s = io('http://localhost:4000', { auth: { userId: 'mobile-user' } });
    s.on('message:receive', (msg) => setMessages((m) => [...m, msg]));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const send = () => {
    socket?.emit('message:send', { to: 'user123', ciphertext: input, msgId: Date.now() });
    setInput('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111b21', paddingTop: 50 }}>
      <FlatList data={messages} renderItem={({item}) => <Text style={{color: 'white'}}>{item.from}: {item.ciphertext}</Text>} />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput style={{ flex: 1, backgroundColor: '#2a3942', color: 'white' }} value={input} onChangeText={setInput} />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}
