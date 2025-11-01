import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, Alert } from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { db, ensureAuth } from '../services/firebase';
import { pickWords } from '../services/gameLogic';

export default function LobbyScreen({ route, navigation }) {
  const { code: incomingCode, playerId: incomingPlayerId, playerName } = route.params || {};
  const [code, setCode] = useState(incomingCode || '');
  const [players, setPlayers] = useState([]);
  const [localPlayerId, setLocalPlayerId] = useState(incomingPlayerId || null);
  const [name, setName] = useState(playerName || '');

  useEffect(()=> {
    if (!code) return;
    const playersRef = ref(db, `rooms/${code}/players`);
    const unsub = onValue(playersRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list = Object.keys(val).map(k => val[k]);
      setPlayers(list);
    });
    return ()=> unsub();
  }, [code]);

  async function handleAddLocalPlayer() {
    if (!code) {
      const newCode = Math.floor(1000 + Math.random()*9000).toString();
      setCode(newCode);
      const user = await ensureAuth();
      await set(ref(db, `rooms/${newCode}`), { host: name || 'Host', hostUid: user.uid, state: 'waiting', createdAt: Date.now() });
    }
    const user = await ensureAuth();
    setLocalPlayerId(user.uid);
    await set(ref(db, `rooms/${code}/players/${user.uid}`), { id: user.uid, name: name || 'Player', score: 0 });
  }

  async function startGame() {
    // read players once
    const snap = await get(ref(db, `rooms/${code}/players`));
    const psObj = snap.val() || {};
    const ps = Object.keys(psObj).map(k => psObj[k]);
    if (ps.length < 3) { Alert.alert('Need 3+ players'); return; }
    // pick words
    const { real, imposter } = pickWords('animals');
    // assign roles and write each player doc
    const impIndex = Math.floor(Math.random()*ps.length);
    for (let i=0;i<ps.length;i++) {
      const p = ps[i];
      const role = i===impIndex ? 'imposter' : 'regular';
      const word = role==='imposter' ? imposter : real;
      await set(ref(db, `rooms/${code}/players/${p.id}`), { ...p, role, word, clue: null, vote: null });
    }
    await set(ref(db, `rooms/${code}`), { host: name || 'Host', hostUid: (await ensureAuth()).uid, state: 'playing', startedAt: Date.now() });
    navigation.navigate('Game', { code, localPlayerId });
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
