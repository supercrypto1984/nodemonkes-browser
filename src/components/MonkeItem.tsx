import type React from "react"
import type { Monke } from "../types"
import { getImageColors } from "../utils/api"
import { formatScriptPubkey, calculatePercentage } from "../utils/helpers"
import "./MonkeItem.css"

interface MonkeItemProps {
  monke: Monke
  index: number
}

const MonkeItem: React.FC<MonkeItemProps> = ({ monke, index }) => {
  // 安全地构建图片URL
  const imageUrl = `https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/${monke.id || "default"}.png`

  // Only use lazy loading for images below the first 3 rows
  const shouldLazyLoad = index >= 3

  const handleImageLoad = async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement
    const colorBarElement = document.getElementById(`color-bar-${monke.id}`)

    if (!colorBarElement) return

    try {
      const colors = await getImageColors(imageUrl)
      const topColors = colors.slice(0, 5) // 只取前5种颜色
      const colorBarHtml = `
        <div class="color-cell">
          <div class="color-count">${topColors.length}</div>
          <div class="color-bar">
            ${topColors
              .map(
                (color) =>
                  `<div class="color-segment" style="background-color: rgb(${color.r},${color.g},${color.b}); flex: ${color.count};"></div>`,
              )
              .join("")}
          </div>
        </div>`
      colorBarElement.innerHTML = colorBarHtml
    } catch (error) {
      console.error("Failed to analyze image colors:", error)
      colorBarElement.innerHTML = '<div class="color-cell"><div class="color-count">Error</div></div>'
    }
  }

  // 安全地处理属性
  const safeAttributes = monke.attributes || {}

  // 调试输出
  console.log(`Monke ${monke.id} scriptPubkey:`, monke.scriptPubkey)

  return (
    <tr className="monke-item">
      <td className="monke-id">{monke.id || "N/A"}</td>
      <td className="monke-image-cell">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={`Nodemonke ${monke.id || "Unknown"}`}
          className="monke-image"
          loading={shouldLazyLoad ? "lazy" : "eager"}
          onLoad={handleImageLoad}
          onError={(e) => e.currentTarget.classList.add("error")}
        />
      </td>
      <td id={`color-bar-${monke.id}`}>
        <div className="color-cell">
          <div class="color-count">Loading...</div>
        </div>
      </td>
      <td>
        <div className="traits-list">
          {Object.entries(safeAttributes)
            .filter(([key]) => !key.endsWith("Count") && key !== "Count")
            .map(([key, value]) => {
              const countKey = `${key}Count` as keyof typeof safeAttributes
              const count = safeAttributes[countKey] as number
              const percentage = calculatePercentage(count)
              const isRare = Number.parseFloat(percentage) < 1
              return (
                <div key={key} className={`trait-item ${isRare ? "rare" : ""}`}>
                  {key}: {value || "N/A"} ({percentage}%)
                </div>
              )
            })}
          <div className="trait-item">Count: {safeAttributes.Count || 0}</div>
        </div>
      </td>
      <td className="monke-rank">{monke.rank || "-"}</td>
      <td className="monke-inscription">{monke.inscription || "N/A"}</td>
      <td className="monke-block">{monke.block || "N/A"}</td>
      <td>
        <div className="script-pubkey">{formatScriptPubkey(monke.scriptPubkey)}</div>
      </td>
    </tr>
  )
}

export default MonkeItem
