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
      <div className="monkes-grid">
        {monkes.slice(0, 50).map((monke) => (
          <div key={monke.id} className="monke-card">
            <img 
              src={`https://raw.githubusercontent.com/supercrypto1120/nodemonkes-gallery/main/images/${monke.id}.png`}
              alt={`Node Monke #${monke.id}`}
              className="monke-image"
            />
            <div className="monke-info">
              <div className="monke-id">#{monke.id}</div>
              <div className="monke-traits">
                {Object.entries(monke.attributes)
                  .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
                  .map(([key, value]) => (
                    <div key={key} className="trait">
                      {key}: {value}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonkesList

