import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import io from 'socket.io-client';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    const s = io('http://localhost:4000', { auth: { userId: 'mobile-user' } });
    s.on('message:receive', (msg) => setMessages((m) => [...m, msg]));
    s.on('reaction:update', ({ msgId, reactions }) => {
      setMessages(m => m.map(msg => msg.msgId === msgId ? {...msg, reactions} : msg));
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setRecording(recording);
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    // Upload logic here similar to web
    socket?.emit('message:send', { to: 'user123', type: 'voice', mediaKey: uri, msgId: Date.now() });
  };

  const addReaction = (msgId, emoji) => {
    socket.emit('reaction:add', { msgId, emoji, userId: 'mobile-user' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <TouchableOpacity><Text style={styles.icon}>💬</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.icon}>⭕</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.icon}>📞</Text></TouchableOpacity>
      </View>
      <View style={styles.main}>
        <FlatList data={messages} renderItem={({item}) => 
          <View style={styles.msgContainer}>
            <View style={styles.bubble}>
              {item.type==='voice' ? <Text style={styles.text}>🎤 Voice Message</Text> : <Text style={styles.text}>{item.message}</Text>}
              <View style={styles.reactions}>
                {item.reactions && Object.entries(item.reactions).map(([emoji, count]) => (
                  <Text key={emoji} style={styles.reaction}>{emoji} {count}</Text>
                ))}
              </View>
            </View>
            <View style={styles.reactionBar}>
              <TouchableOpacity onPress={() => addReaction(item.msgId, '👍')}><Text>👍</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => addReaction(item.msgId, '❤️')}><Text>❤️</Text></TouchableOpacity>
            </View>
          </View>
        } />
        <View style={styles.inputBar}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Message" placeholderTextColor="#7d8b99" />
          <TouchableOpacity style={styles.micBtn} onPress={recording ? stopRecording : startRecording}>
            <Text>{recording ? '⏹️' : '🎤'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={() => {
            socket?.emit('message:send', { to: 'user123', message: input, msgId: Date.now() });
            setInput('');
          }}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#17212b' },
  sidebar: { width: 60, backgroundColor: '#0e1621', alignItems: 'center', paddingTop: 50 },
  icon: { fontSize: 24, marginVertical: 10 },
  main: { flex: 1, backgroundColor: '#0e1621' },
  msgContainer: { margin: 8 },
  bubble: { backgroundColor: '#182533', padding: 10, borderRadius: 8, alignSelf: 'flex-start' },
  text: { color: '#ffffff' },
  reactions: { flexDirection: 'row', marginTop: 4 },
  reaction: { backgroundColor: '#17212b', paddingHorizontal: 4, borderRadius: 10, marginRight: 4, fontSize: 12 },
  reactionBar: { flexDirection: 'row', marginTop: 4 },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#0e1621' },
  input: { flex: 1, backgroundColor: '#17212b', color: '#fff', padding: 10, borderRadius: 20 },
  micBtn: { backgroundColor: '#5288c1', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 20, marginLeft: 8 },
  sendBtn: { backgroundColor: '#5288c1', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 20, marginLeft: 8 },
  sendText: { color: '#fff' }
});
