// 日期字串一律以裝置本地時區處理
// 不要用 toISOString()：它回傳 UTC，在台灣（UTC+8）凌晨 0–8 點會變成前一天
// 也不要用 new Date('YYYY-MM-DD')：它會被解析成 UTC 午夜，而非本地午夜

const pad = (n: number) => String(n).padStart(2, '0')

// Date → 'YYYY-MM-DD'
export const formatLocalDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// Date → 'YYYY-MM'
export const formatLocalMonth = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

// 'YYYY-MM-DD' → 本地午夜的 Date
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}
