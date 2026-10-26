const keyToCamelot = (key) => {
  const keyMap = {
    C: '8B',
    'C#': '3B',
    Db: '3B',
    D: '10B',
    'D#': '5B',
    Eb: '5B',
    E: '12B',
    F: '7B',
    'F#': '2B',
    Gb: '2B',
    G: '9B',
    'G#': '4B',
    Ab: '4B',
    A: '11B',
    'A#': '6B',
    Bb: '6B',
    B: '1B',
  };

  const minorKeyMap = {
    C: '5A',
    'C#': '12A',
    Db: '12A',
    D: '7A',
    'D#': '2A',
    Eb: '2A',
    E: '9A',
    F: '4A',
    'F#': '11A',
    Gb: '11A',
    G: '6A',
    'G#': '1A',
    Ab: '1A',
    A: '8A',
    'A#': '3A',
    Bb: '3A',
    B: '10A',
  };

  const isMinor = key.endsWith('m');
  const root = isMinor ? key.slice(0, -1) : key;

  if (isMinor) {
    return minorKeyMap[root];
  }

  return keyMap[root];
};

const getCompatibleKeys = (camelotKey) => {
  const number = parseInt(camelotKey)
  const letter = camelotKey.slice(-1)

  const previousNumber = number === 1 ? 12 : number - 1
  const nextNumber = number === 12 ? 1 : number + 1

  return [
    `${previousNumber}${letter}`,
    `${number}${letter}`,
    `${nextNumber}${letter}`,
    `${number}${letter === 'A' ? 'B' : 'A'}`
  ]
}

module.exports = {
  getCompatibleKeys,
  keyToCamelot
}