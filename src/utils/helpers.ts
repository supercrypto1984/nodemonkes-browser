export function formatScriptPubkey(pubkey: string): string {
  const parts = pubkey.split(' ');
  if (parts.length < 4) return pubkey;
  
  const op1 = parts[0];
  const op2 = parts[1] + ' ' + parts[2];
  const hash = parts[3];
  
  const chunkSize = 32;
  const hashChunks = [];
  for (let i = 0; i < hash.length; i += chunkSize) {
    hashChunks.push(hash.slice(i, i + chunkSize));
  }
  
  return `${op1}\n${op2}\n${hashChunks.join('\n')}`;
}

export function calculatePercentage(count: number): string {
  const TOTAL_MONKES = 10000;
  return ((count / TOTAL_MONKES) * 100).toFixed(2);
}

