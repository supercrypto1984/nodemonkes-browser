export interface Monke {
  id: number;
  attributes: {
    [key: string]: string | number;
    Body: string;
    Eyes: string;
    Earring: string;
    Head: string;
    Count: number;
    BodyCount?: number;
    EyesCount?: number;
    EarringCount?: number;
    HeadCount?: number;
  };
  rank?: number;
  inscription: number;
  block: number;
  scriptPubkey: string;
}

export interface ColorInfo {
  r: number;
  g: number;
  b: number;
  count: number;
}

