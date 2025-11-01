import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ensureAuth, db } from '../services/firebase';
import { ref, set } from 'firebase/database';
import { generateRoomCode } from '../services/gameLogic';

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState('');

  useEffect(()=> {
    ensureAuth().catch(()=>{});
  }, []);

  async function handleCreate() {
    const code = generateRoomCode();
    const user = (await ensureAuth());
    const roomRef = ref(db, `rooms/${code}`);
    await set(roomRef, { host: name || 'Host', hostUid: user.uid, state: 'waiting', createdAt: Date.now() });
    // create player entry
    const playerRef = ref(db, `rooms/${code}/players/${user.uid}`);
    await set(playerRef, { id: user.uid, name: name || 'Host', score: 0 });
    navigation.navigate('Lobby', { code, playerId: user.uid });
  }

  function handleJoin() {
    navigation.navigate('Lobby', { code: null, playerName: name });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Imposter Who (Realtime)</Text>
      <TextInput placeholder="Your name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Create Lobby" onPress={handleCreate} />
      <View style={{height:12}} />
      <Button title="Join Lobby" onPress={handleJoin} />
    </View>
  );
}

const styles = StyleSheet.create({ container:{flex:1,justifyContent:'center',padding:20}, title:{fontSize:22, marginBottom:20, textAlign:'center'}, input:{borderWidth:1,borderColor:'#ccc',padding:10,marginBottom:12,borderRadius:6} });
