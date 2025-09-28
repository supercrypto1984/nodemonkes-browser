import type { Monke, ColorInfo } from "../types"

const JSON_URL = "https://metadata.138148178.xyz/metadata.json"

export async function fetchMonkes(): Promise<Monke[]> {
  try {
    console.log("Fetching monkes data from:", JSON_URL)
    const response = await fetch(JSON_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Raw data structure:", data)

    // 处理不同的数据结构
    let monkesData = data
    if (data.nodemonkes) {
      monkesData = data.nodemonkes
    } else if (data.data) {
      monkesData = data.data
    } else if (Array.isArray(data)) {
      monkesData = data
    }

    console.log("Processed monkes data:", monkesData)

    // 确保数据是数组并标准化字段名
    const normalizedData = Array.isArray(monkesData) ? monkesData.map(normalizeMonkeData) : []

    console.log("Normalized data sample:", normalizedData.slice(0, 2))
    return normalizedData
  } catch (error) {
    console.error("Error fetching monkes:", error)
    throw error
  }
}

// 标准化数据字段名
function normalizeMonkeData(monke: any): Monke {
  return {
    id: monke.id || monke.ID || monke.number,
    attributes: monke.attributes || monke.traits || {},
    rank: monke.rank || monke.rarity_rank,
    inscription: monke.inscription || monke.inscription_id || monke.inscriptionId,
    block: monke.block || monke.block_height || monke.blockHeight,
    scriptPubkey: monke.scriptPubkey || monke.script_pubkey || monke.pubkey || monke.address || monke.scriptpubkey,
  }
}

export async function getImageColors(imageUrl: string): Promise<ColorInfo[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      const colorMap = new Map<string, number>()

      // Analyze each pixel
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        // Skip transparent pixels
        if (a === 0) continue

        const colorKey = `${r},${g},${b}`
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
      }

      // Convert to array and sort by count
      const colors = Array.from(colorMap.entries())
        .map(([color, count]) => {
          const [r, g, b] = color.split(",").map(Number)
          return { r, g, b, count }
        })
        .sort((a, b) => b.count - a.count)

      resolve(colors)
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = imageUrl
  })
}
