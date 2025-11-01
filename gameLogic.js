import { v4 as uuidv4 } from 'uuid';

const WORDS = {
  animals: ['dog','cat','lion','tiger','elephant','giraffe','zebra','horse','fox','wolf'],
  food: ['pizza','burger','sushi','pasta','apple','banana','steak','salad','taco','bread'],
  movies: ['inception','avatar','titanic','joker','matrix','gladiator','frozen','parasite','up','alien']
};

function randFrom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

export function generateRoomCode() {
  return Math.floor(1000 + Math.random()*9000).toString();
}

export function pickWords(category='animals') {
  const list = WORDS[category] || WORDS['animals'];
  const real = randFrom(list);
  let imposter = randFrom(list);
  while (imposter === real) imposter = randFrom(list);
  return { real, imposter };
}

export function assignRoles(players, category='animals') {
  const { real, imposter } = pickWords(category);
  const impIndex = Math.floor(Math.random()*players.length);
  return players.map((p,i)=>({
    ...p,
    word: i===impIndex ? imposter : real,
    role: i===impIndex ? 'imposter' : 'regular',
  }));
}
