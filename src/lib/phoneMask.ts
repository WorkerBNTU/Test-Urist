export const PHONE_DIGIT_COUNT = 10

/** Извлекает 10 локальных цифр (без кода страны) */
export function extractLocalDigits(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, PHONE_DIGIT_COUNT)
}

/** Форматирует локальную часть: (999) 123-45-67 */
export function formatLocalPart(digits: string): string {
  const d = digits.slice(0, PHONE_DIGIT_COUNT)
  if (!d.length) return ''

  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  if (d.length <= 8) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`
}

export function formatFullPhone(digits: string): string {
  const d = digits.slice(0, PHONE_DIGIT_COUNT)
  if (!d.length) return ''
  return `+7 ${formatLocalPart(d)}`
}

/** Сколько цифр находится до позиции курсора */
export function countDigitsBefore(value: string, position: number): number {
  return value.slice(0, position).replace(/\D/g, '').length
}

/** Позиция курсора после N-й цифры в отформатированной строке */
export function caretAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0

  let count = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      count++
      if (count === digitCount) return i + 1
    }
  }
  return formatted.length
}
