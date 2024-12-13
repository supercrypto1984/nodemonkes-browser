export interface Monke {
  id: number;
  attributes: {
    Body: string;
    Eyes: string;
    Earring: string;
    Head: string;
    Count: number;
    [key: string]: any;
  };
  rank?: number;
  inscription: number;
  block: number;
  scriptPubkey: string;
}

const JSON_URL = 'https://nodemonkes.4everland.store/transformed_metadata.json';

export async function fetchMonkes(): Promise<Monke[]> {
  try {
    const response = await fetch(JSON_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch monkes data');
    }
    const data = await response.json();
    return data.nodemonkes || data;
  } catch (error) {
    console.error('Error fetching monkes:', error);
    throw error;
  }
}

