import React from 'react';
import { View, Text } from 'react-native';

export default function PlayerList({ players }) {
  return (
    <View>
      {players.map(p=> <Text key={p.id}>{p.name} — Score: {p.score || 0}</Text>)}
    </View>
  );
}
