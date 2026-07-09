import { useRef } from 'react'
import {
  caretAfterDigits,
  countDigitsBefore,
  extractLocalDigits,
  formatLocalPart,
} from '../lib/phoneMask'

interface PhoneInputProps {
  value: string
  onChange: (digits: string) => void
  onBlur?: () => void
  disabled?: boolean
  hasError?: boolean
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  hasError = false,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const digits = value.slice(0, 10)
  const display = formatLocalPart(digits)

  function applyChange(raw: string, cursorPos: number) {
    const digitsBefore = countDigitsBefore(raw, cursorPos)
    const nextDigits = extractLocalDigits(raw)
    const nextDisplay = formatLocalPart(nextDigits)

    onChange(nextDigits)

    requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input) return
      const nextCursor = caretAfterDigits(nextDisplay, digitsBefore)
      input.setSelectionRange(nextCursor, nextCursor)
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyChange(e.target.value, e.target.selectionStart ?? e.target.value.length)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const input = inputRef.current
    if (!input) return

    const start = input.selectionStart ?? display.length
    const end = input.selectionEnd ?? display.length
    const merged = display.slice(0, start) + pasted + display.slice(end)
    applyChange(merged, start + pasted.length)
  }

  return (
    <div
      className={`phone-input${hasError ? ' phone-input--error' : ''}${
        disabled ? ' phone-input--disabled' : ''
      }`}
    >
      <span className="phone-input__country">+7</span>
      <input
        ref={inputRef}
        id={id}
        type="tel"
        className="phone-input__field"
        value={display}
        onChange={handleChange}
        onPaste={handlePaste}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="(999) 123-45-67"
        autoComplete="tel-national"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        inputMode="numeric"
      />
    </div>
  )
}
