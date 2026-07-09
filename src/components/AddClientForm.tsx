import { useState, type FormEvent } from 'react'
import {
  formatPhoneFromDigits,
  validateClientForm,
  validateName,
  validatePhoneDigits,
  type FormErrors,
} from '../lib/validation'
import { Modal } from './Modal'
import { PhoneInput } from './PhoneInput'

interface AddClientFormProps {
  onAdd: (name: string, phone: string) => Promise<void>
  loading: boolean
}

export function AddClientForm({ onAdd, loading }: AddClientFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState({ name: false, phone: false })

  function resetForm() {
    setName('')
    setPhoneDigits('')
    setErrors({})
    setTouched({ name: false, phone: false })
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    resetForm()
  }

  function handleNameBlur() {
    setTouched((t) => ({ ...t, name: true }))
    setErrors((e) => ({ ...e, name: validateName(name) }))
  }

  function handlePhoneBlur() {
    setTouched((t) => ({ ...t, phone: true }))
    setErrors((e) => ({ ...e, phone: validatePhoneDigits(phoneDigits) }))
  }

  function handleNameChange(value: string) {
    setName(value)
    if (touched.name) {
      setErrors((e) => ({ ...e, name: validateName(value) }))
    }
  }

  function handlePhoneChange(digits: string) {
    setPhoneDigits(digits)
    if (touched.phone) {
      setErrors((e) => ({ ...e, phone: validatePhoneDigits(digits) }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, phone: true })

    const formErrors = validateClientForm(name, phoneDigits)
    setErrors(formErrors)
    if (Object.keys(formErrors).length > 0) return

    await onAdd(name.trim(), formatPhoneFromDigits(phoneDigits))
    setOpen(false)
    resetForm()
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Добавить клиента
      </button>

      <Modal open={open} onClose={handleClose} title="Новый клиент">
        <form className="add-form" onSubmit={handleSubmit} noValidate>
          <div className="form-fields">
            <label className={`field${errors.name && touched.name ? ' field--error' : ''}`}>
              <span className="field-label">Имя *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="Иванов Иван"
                autoFocus
                aria-invalid={!!errors.name && touched.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && touched.name && (
                <span className="field-error" id="name-error" role="alert">
                  {errors.name}
                </span>
              )}
            </label>

            <div className={`field${errors.phone && touched.phone ? ' field--error' : ''}`}>
              <span className="field-label">Телефон *</span>
              <PhoneInput
                value={phoneDigits}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                disabled={loading}
                hasError={!!errors.phone && touched.phone}
                aria-invalid={!!errors.phone && touched.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && touched.phone && (
                <span className="field-error" id="phone-error" role="alert">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
