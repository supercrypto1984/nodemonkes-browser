import React, { useState, useEffect } from 'react'

interface Monke {
  id: number
  attributes: {
    Body: string
    Eyes: string
    Earring: string
    Head: string
    Count: number
    [key: string]: any
  }
  rank?: number
  inscription?: number
  block?: number
  scriptPubkey?: string
}

const MonkesList: React.FC = () => {
  const [monkes, setMonkes] = useState<Monke[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonkes = async () => {
      try {
        const response = await fetch('https://nodemonkes.4everland.store/transformed_metadata.json')
        if (!response.ok) {
          throw new Error('Failed to fetch monkes data')
        }
        const data = await response.json()
        setMonkes(data.nodemonkes || data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monkes')
      } finally {
        setLoading(false)
      }
    }

    fetchMonkes()
  }, [])

  if (loading) {
    return <div>Loading Node Monkes...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="monkes-container">
      <table className="monkes-table">
        <thead>
          <tr>
            <th>#</th>
            <th>NODEMONKE</th>
            <th>COLOR</th>
            <th>TRAITS</th>
            <th>RANK</th>
            <th>INSCRIPTION #</th>
            <th>BLOCK HEIGHT</th>
            <th>SCRIPT PUBKEY</th>
          </tr>
        </thead>
        <tbody>
          {monkes.map((monke) => (
            <tr key={monke.id}>
              <td>{monke.id}</td>
              <td>
                <img 
                  src={`https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/${monke.id}.png`}
                  alt={`Node Monke #${monke.id}`}
                  className="monke-image"
                />
              </td>
              <td>
                {/* 这里需要实现颜色分析 */}
                <div className="color-analysis"></div>
              </td>
              <td>
                {Object.entries(monke.attributes)
                  .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
                  .map(([key, value]) => (
                    <div key={key} className="trait">
                      {key}: {value} ({((monke.attributes[`${key}Count`] as number) / 10000 * 100).toFixed(1)}%)
                    </div>
                  ))}
                <div className="trait">Count: {monke.attributes.Count}</div>
              </td>
              <td>{monke.rank || '-'}</td>
              <td>{monke.inscription || '-'}</td>
              <td>{monke.block || '-'}</td>
              <td>{monke.scriptPubkey || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MonkesList
