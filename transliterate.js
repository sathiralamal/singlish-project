// Singlish to Sinhala Unicode Transliteration Engine
// Converts romanized Sinhala (Singlish) to Sinhala Unicode in real-time

const VIRAMA = '\u0DCA'; // ් (Hal Kirima)

// Standalone vowels (used at start of word / after another vowel)
const standaloneVowels = {
  'aee': '\u0D88', // ඈ
  'ae':  '\u0D87', // ඇ
  'aa':  '\u0D86', // ආ
  'au':  '\u0D96', // ඖ
  'ai':  '\u0D93', // ඓ
  'a':   '\u0D85', // අ
  'ii':  '\u0D8A', // ඊ
  'i':   '\u0D89', // ඉ
  'uu':  '\u0D8C', // ඌ
  'u':   '\u0D8B', // උ
  'ee':  '\u0D92', // ඒ
  'e':   '\u0D91', // එ
  'oo':  '\u0D95', // ඕ
  'o':   '\u0D94', // ඔ
};

// Vowel diacritic signs (used after consonants)
const vowelSigns = {
  'aee': '\u0DD1', // ෑ
  'ae':  '\u0DD0', // ැ
  'aa':  '\u0DCF', // ා
  'au':  '\u0DDE', // ෞ
  'ai':  '\u0DDB', // ෛ
  // 'a' = inherent vowel, no diacritic needed
  'ii':  '\u0DD3', // ී
  'i':   '\u0DD2', // ි
  'uu':  '\u0DD6', // ූ
  'u':   '\u0DD4', // ු
  'ee':  '\u0DDA', // ේ
  'e':   '\u0DD9', // ෙ
  'oo':  '\u0DDD', // ෝ
  'o':   '\u0DDC', // ො
};

// Consonant patterns: [romanized, unicode, isSpecial]
// isSpecial = true → output directly without virama logic (e.g. anusvara)
// Ordered longest-first so greedy match picks the right one
const consonantPatterns = [
  // 3-char
  ['ksh', '\u0D9A\u0DCA\u0DC2', false], // ක්ෂ
  // 2-char
  ['ch',  '\u0DA0', false], // ච
  ['sh',  '\u0DC1', false], // ශ
  ['kh',  '\u0D9B', false], // ඛ
  ['gh',  '\u0D9D', false], // ඝ
  ['jh',  '\u0DA3', false], // ඣ
  ['Th',  '\u0DA8', false], // ඨ
  ['Dh',  '\u0DAA', false], // ඪ
  ['th',  '\u0DAE', false], // ථ
  ['dh',  '\u0DB0', false], // ධ
  ['ph',  '\u0DB5', false], // ඵ
  ['bh',  '\u0DB7', false], // භ
  ['Sh',  '\u0DC2', false], // ෂ
  ['ng',  '\u0D9E', false], // ඞ
  ['ny',  '\u0DA4', false], // ඤ
  ['gn',  '\u0DA4', false], // ඤ (alternate)
  // 1-char
  ['k',   '\u0D9A', false], // ක
  ['g',   '\u0D9C', false], // ග
  ['c',   '\u0DA0', false], // ච
  ['j',   '\u0DA2', false], // ජ
  ['T',   '\u0DA7', false], // ට
  ['D',   '\u0DA9', false], // ඩ
  ['N',   '\u0DAB', false], // ණ
  ['t',   '\u0DAD', false], // ත
  ['d',   '\u0DAF', false], // ද
  ['n',   '\u0DB1', false], // න
  ['p',   '\u0DB4', false], // ප
  ['b',   '\u0DB6', false], // බ
  ['m',   '\u0DB8', false], // ම
  ['M',   '\u0D82', true],  // ං anusvara (special — no virama)
  ['y',   '\u0DBA', false], // ය
  ['r',   '\u0DBB', false], // ර
  ['l',   '\u0DBD', false], // ල
  ['v',   '\u0DC0', false], // ව
  ['w',   '\u0DC0', false], // ව
  ['S',   '\u0DC1', false], // ශ
  ['s',   '\u0DC3', false], // ස
  ['h',   '\u0DC4', false], // හ
  ['L',   '\u0DC5', false], // ළ
  ['f',   '\u0DC6', false], // ෆ
  ['H',   '\u0D83', true],  // ඃ visarga (special)
];

// Vowel patterns ordered longest-first for correct greedy matching
const vowelPatterns = ['aee', 'ae', 'aa', 'au', 'ai', 'ii', 'uu', 'ee', 'oo', 'a', 'i', 'u', 'e', 'o'];

function matchConsonant(str, pos) {
  for (const [pat, ch, special] of consonantPatterns) {
    if (str.startsWith(pat, pos)) {
      return { length: pat.length, char: ch, isSpecial: special };
    }
  }
  return null;
}

function matchVowel(str, pos) {
  for (const v of vowelPatterns) {
    if (str.startsWith(v, pos)) {
      return { length: v.length, value: v };
    }
  }
  return null;
}

function transliterate(input) {
  let output = '';
  let i = 0;

  while (i < input.length) {
    const con = matchConsonant(input, i);

    if (con) {
      output += con.char;
      i += con.length;

      if (!con.isSpecial) {
        // Look ahead for a vowel
        const vow = matchVowel(input, i);
        if (vow) {
          if (vow.value !== 'a') {
            // Add vowel diacritic; 'a' is inherent — nothing to add
            output += vowelSigns[vow.value] || '';
          }
          i += vow.length;
        } else {
          // No vowel: add virama (hal kirima)
          output += VIRAMA;
        }
      }
    } else {
      // Try standalone vowel
      const vow = matchVowel(input, i);
      if (vow) {
        output += standaloneVowels[vow.value] || '';
        i += vow.length;
      } else {
        // Pass through: spaces, numbers, punctuation
        output += input[i];
        i++;
      }
    }
  }

  return output;
}

// Export for Node.js; also works in browser as a plain script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { transliterate };
}
