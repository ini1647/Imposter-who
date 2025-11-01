import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../services/firebase';

export default function GameScreen({ route, navigation }) {
  const { code, localPlayerId } = route.params;
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [clue, setClue] = useState('');
  const [phase, setPhase] = useState('clue');

  useEffect(()=> {
    const playerRef = ref(db, `rooms/${code}/players/${localPlayerId}`);
    const unsubPlayer = onValue(playerRef, (snap) => { setPlayer(snap.val()); });

    const playersRef = ref(db, `rooms/${code}/players`);
    const unsubPlayers = onValue(playersRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.keys(val).map(k=>val[k]);
      setPlayers(list);
      const allClues = list.every(p => p.clue);
      const allVotes = list.every(p => p.vote);
      if (allClues && phase === 'clue') setPhase('voting');
      if (allVotes && phase === 'voting') {
        // move room state to reveal
        set(ref(db, `rooms/${code}/state`), 'reveal');
        navigation.navigate('Results', { code, localPlayerId });
      }
    });

    return ()=> { unsubPlayer(); unsubPlayers(); };
  }, [phase]);

  async function submitClue() {
    await set(ref(db, `rooms/${code}/players/${localPlayerId}/clue`), clue);
  }

  async function handleVote(votedId) {
    await set(ref(db, `rooms/${code}/players/${localPlayerId}/vote`), votedId);
  }

  if (!player) return <View style={styles.container}><Text>Loading...</Text></View>;

  if (phase === 'clue') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Word</Text>
        <Text style={{fontSize:22, marginVertical:12}}>{player.word}</Text>
        <TextInput placeholder="Type a clue (no direct word)" value={clue} onChangeText={setClue} style={styles.input} />
        <Button title="Submit Clue" onPress={submitClue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voting Phase</Text>
      <FlatList data={players.filter(p=>p.id!==localPlayerId)} keyExtractor={i=>i.id} renderItem={({item})=>(
        <Button title={`${item.name}${item.vote ? ' (voted)' : ''}`} onPress={()=>handleVote(item.id)} />
      )} />
      <Text style={{marginTop:12}}>Votes so far: {players.filter(p=>p.vote).length} / {players.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({container:{flex:1,padding:20},title:{fontSize:20,marginBottom:12},input:{borderWidth:1,borderColor:'#ccc',padding:10,marginVertical:12}});
