export interface MonkeAttributes {
  // 修复：通用索引签名现在包括 undefined，以兼容可选属性
  [key: string]: string | number | undefined 
  
  // 明确定义的属性 (现在与通用签名兼容)
  Body?: string
  Eyes?: string
  Earring?: string
  Head?: string

  Count?: number
  BodyCount?: number
  EyesCount?: number
  EarringCount?: number
  HeadCount?: number
}

export interface Monke {
  id: number
  attributes: MonkeAttributes
  rank?: number
  // 修复：根据 API 数据标准化，inscription 可以是 number 或 string
  inscription: number | string 
  block: number
  scriptPubkey?: string
  script_pubkey?: string // 备用字段名
  pubkey?: string // 备用字段名
  address?: string // 备用字段名
}

export interface ColorInfo {
  r: number
  g: number
  b: number
  count: number
}
