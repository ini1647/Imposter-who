import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import { doc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ResultScreen({ route, navigation }) {
  const { code, localPlayerId } = route.params;
  const [players, setPlayers] = useState([]);
  const [realWord, setRealWord] = useState(null);
  const [imposter, setImposter] = useState(null);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(()=> {
    async function load() {
      const col = collection(db, 'rooms', code, 'players');
      const snaps = await getDocs(col);
      const list = snaps.docs.map(d=>d.data());
      setPlayers(list);
      const regular = list.find(p=>p.role==='regular');
      const imp = list.find(p=>p.role==='imposter');
      setRealWord(regular?.word);
      setImposter(imp);
    }
    load();
  }, []);

  function tallyVotes() {
    const counts = {};
    for (const p of players) {
      if (p.vote) counts[p.vote] = (counts[p.vote] || 0) + 1;
    }
    const maxVotes = Math.max(...Object.values(counts || {0:0}));
    const votedId = Object.keys(counts).find(id => counts[id] === maxVotes);
    return players.find(p=>p.id===votedId);
  }

  async function updateScores(imposterCaught, impGuessedCorrectly) {
    for (const p of players) {
      const ref = doc(db, 'rooms', code, 'players', p.id);
      let delta = 0;
      if (p.role === 'imposter') {
        delta = imposterCaught ? -1 : impGuessedCorrectly ? 2 : 1;
      } else {
        delta = imposterCaught ? 1 : -1;
      }
      const newScore = (p.score || 0) + delta;
      await updateDoc(ref, { score: newScore });
    }
  }

  async function handleReveal() {
    if (revealed) return;
    const votedOut = tallyVotes();
    const imposterCaught = votedOut?.role === 'imposter';
    setRevealed(true);

    if (imposterCaught) {
      Alert.alert('Imposter Caught!', 'The group wins!');
      await updateScores(true, false);
    } else if (localPlayerId === imposter?.id) {
      Alert.alert('You are the imposter!', 'Guess the true word to win!');
    } else {
      Alert.alert('Imposter Escaped!', 'Now waiting for the imposter to guess.');
    }
  }

  async function handleGuess() {
    const correct = guess.toLowerCase() === realWord?.toLowerCase();
    if (correct) {
      Alert.alert('Imposter Wins!', 'You guessed correctly!');
      await updateScores(false, true);
    } else {
      Alert.alert('Group Wins!', 'The imposter guessed wrong!');
      await updateScores(true, false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reveal Phase</Text>
      <FlatList data={players} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={styles.item}>
          <Text>{item.name} — Vote: {item.vote ? players.find(p=>p.id===item.vote)?.name : 'No vote'} | Score: {item.score || 0}</Text>
        </View>
      )} />
      <Button title="Reveal Results" onPress={handleReveal} />
      {localPlayerId === imposter?.id && revealed && (
        <View style={{marginTop:20}}>
          <Text>Guess the true word:</Text>
          <TextInput value={guess} onChangeText={setGuess} style={styles.input} />
          <Button title="Submit Guess" onPress={handleGuess} />
        </View>
      )}
      <View style={{height:12}} />
      <Button title="Next Round" onPress={()=>navigation.navigate('Lobby', { code, playerId: localPlayerId })} />
    </View>
  );
}

const styles = StyleSheet.create({container:{flex:1,padding:20},title:{fontSize:20,marginBottom:8},item:{padding:8,borderBottomWidth:1,borderColor:'#eee'},input:{borderWidth:1,borderColor:'#ccc',padding:10,marginVertical:12}});
