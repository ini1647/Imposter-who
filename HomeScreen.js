import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ensureAuth, db } from '../services/firebase';
import { generateRoomCode } from '../services/gameLogic';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState('');
  useEffect(() => { ensureAuth().catch(()=>{}); }, []);

  async function handleCreate() {
    const code = generateRoomCode();
    await setDoc(doc(db, 'rooms', code), { host: name || 'Host', state: 'waiting' });
    const id = uuidv4();
    const player = { id, name: name || 'Host', score: 0 };
    await setDoc(doc(db, 'rooms', code, 'players', id), player);
    navigation.navigate('Lobby', { code, playerId: id });
  }

  function handleJoin() {
    navigation.navigate('Lobby', { code: null, playerName: name });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Imposter Who</Text>
      <TextInput placeholder="Your name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Create Lobby" onPress={handleCreate} />
      <View style={{height:12}} />
      <Button title="Join Lobby" onPress={handleJoin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20},
  title:{fontSize:26, marginBottom:20, textAlign:'center'},
  input:{borderWidth:1,borderColor:'#ccc',padding:10,marginBottom:12,borderRadius:6}
});
