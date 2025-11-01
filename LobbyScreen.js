import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList } from 'react-native';
import { doc, onSnapshot, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { generateRoomCode, assignRoles } from '../services/gameLogic';
import { v4 as uuidv4 } from 'uuid';

export default function LobbyScreen({ route, navigation }) {
  const { code: incomingCode, playerId: incomingPlayerId, playerName } = route.params || {};
  const [code, setCode] = useState(incomingCode || '');
  const [players, setPlayers] = useState([]);
  const [localPlayerId, setLocalPlayerId] = useState(incomingPlayerId || null);
  const [name, setName] = useState(playerName || '');

  useEffect(()=> {
    if (!code) return;
    const playersRef = collection(db, 'rooms', code, 'players');
    const unsub = onSnapshot(playersRef, (snap)=> {
      setPlayers(snap.docs.map(d=>d.data()));
    });
    return () => unsub();
  }, [code]);

  async function handleAddLocalPlayer() {
    if (!code) {
      const newCode = generateRoomCode();
      setCode(newCode);
      await setDoc(doc(db, 'rooms', newCode), { host: name || 'Host', state: 'waiting' });
    }
    const id = localPlayerId || uuidv4();
    setLocalPlayerId(id);
    const player = { id, name: name || 'Player', score: 0 };
    await setDoc(doc(db, 'rooms', code, 'players', id), player);
  }

  async function startGame() {
    const q = await getDocs(collection(db, 'rooms', code, 'players'));
    const ps = q.docs.map(d=>d.data());
    const assigned = assignRoles(ps, 'animals');
    for (const p of assigned) {
      await setDoc(doc(db, 'rooms', code, 'players', p.id), p, { merge: true });
    }
    await setDoc(doc(db, 'rooms', code), { state: 'playing' }, { merge: true });
    navigation.navigate('Game', { code, localPlayerId: localPlayerId || assigned[0].id });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <Text>Room Code:</Text>
      <TextInput value={code} onChangeText={setCode} style={styles.input} placeholder="Enter or create code" />
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your display name" />
      <Button title="Join / Add me" onPress={handleAddLocalPlayer} />
      <Text style={{fontWeight:'bold', marginTop:12}}>Players</Text>
      <FlatList data={players} keyExtractor={item=>item.id} renderItem={({item})=>(
        <Text>{item.name} {item.role ? `(${item.role})` : ''} — Score: {item.score || 0}</Text>
      )} />
      <View style={{height:12}} />
      <Button title="Start Game" onPress={startGame} disabled={players.length < 3} />
    </View>
  );
}

const styles = StyleSheet.create({ container:{flex:1,padding:20}, title:{fontSize:20,marginBottom:8}, input:{borderWidth:1,borderColor:'#ccc',padding:10,marginBottom:8,borderRadius:6} });
