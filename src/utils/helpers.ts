export function formatScriptPubkey(pubkey: string | undefined): string {
  if (!pubkey || typeof pubkey !== "string") {
    return "No Script Data"
  }

  // 如果是长字符串，按固定长度分行
  if (pubkey.length > 64) {
    const chunkSize = 64
    const chunks = []
    for (let i = 0; i < pubkey.length; i += chunkSize) {
      chunks.push(pubkey.slice(i, i + chunkSize))
    }
    return chunks.join("\n")
  }

  // 如果包含空格，按空格分割处理
  const parts = pubkey.split(" ")
  if (parts.length >= 4) {
    const op1 = parts[0]
    const op2 = parts[1] + " " + parts[2]
    const hash = parts[3]

    const chunkSize = 32
    const hashChunks = []
    for (let i = 0; i < hash.length; i += chunkSize) {
      hashChunks.push(hash.slice(i, i + chunkSize))
    }

    return `${op1}\n${op2}\n${hashChunks.join("\n")}`
  }

  return pubkey
}

export function calculatePercentage(count: number | undefined): string {
  if (typeof count !== "number" || isNaN(count)) {
    return "0.00"
  }
  const TOTAL_MONKES = 10000
  return ((count / TOTAL_MONKES) * 100).toFixed(2)
}
