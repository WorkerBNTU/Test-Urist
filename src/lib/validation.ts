const NAME_REGEX = /^[а-яА-ЯёЁa-zA-Z\s\-'.]{2,100}$/

export interface FormErrors {
  name?: string
  phone?: string
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return 'Введите имя клиента'
  if (trimmed.length < 2) return 'Имя должно содержать минимум 2 символа'
  if (!NAME_REGEX.test(trimmed)) {
    return 'Имя может содержать только буквы, пробелы и дефис'
  }
  return undefined
}

export function validatePhoneDigits(digits: string): string | undefined {
  if (!digits.length) return 'Введите номер телефона'
  if (digits.length < 10) return 'Введите все 10 цифр номера'
  return undefined
}

export function validatePhone(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith('7') || digits.startsWith('8')
    ? digits.slice(1)
    : digits
  return validatePhoneDigits(local)
}

export function formatPhoneFromDigits(digits: string): string {
  const d = digits.slice(0, 10)
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`
}

export function validateClientForm(name: string, phoneDigits: string): FormErrors {
  const errors: FormErrors = {}
  const nameError = validateName(name)
  const phoneError = validatePhoneDigits(phoneDigits)
  if (nameError) errors.name = nameError
  if (phoneError) errors.phone = phoneError
  return errors
}
