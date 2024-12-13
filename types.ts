export interface Monke {
  id: number;
  attributes: {
    [key: string]: string | number;
    Body?: string;
    Count: number;
  };
  body?: string;
  rank?: number;
  inscription: number;
  block: number;
  scriptPubkey: string;
}

