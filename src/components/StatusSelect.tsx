import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ClientStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'

interface StatusSelectProps {
  value: ClientStatus
  onChange: (status: ClientStatus) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

interface DropdownPosition {
  top: number
  left: number
  minWidth: number
}

export function StatusSelect({
  value,
  onChange,
  disabled = false,
  size = 'md',
}: StatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0, minWidth: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const updatePosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const dropdownHeight = 140
    const gap = 6
    const fitsBelow = rect.bottom + gap + dropdownHeight <= window.innerHeight
    const top = fitsBelow ? rect.bottom + gap : rect.top - gap - dropdownHeight

    setPosition({
      top: Math.max(8, top),
      left: rect.left,
      minWidth: rect.width,
    })
  }, [])

  useEffect(() => {
    if (!open) return

    updatePosition()

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    function handleScrollOrResize() {
      updatePosition()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [open, updatePosition])

  function toggleOpen() {
    if (disabled) return
    setOpen((prev) => !prev)
  }

  const dropdown = open
    ? createPortal(
        <ul
          ref={dropdownRef}
          className="status-dropdown status-dropdown--portal"
          role="listbox"
          style={{
            top: position.top,
            left: position.left,
            minWidth: position.minWidth,
          }}
        >
          {STATUS_ORDER.map((status) => (
            <li key={status} role="option" aria-selected={status === value}>
              <button
                type="button"
                className={`status-option status-option--${status}${
                  status === value ? ' status-option--active' : ''
                }`}
                onClick={() => {
                  onChange(status)
                  setOpen(false)
                }}
              >
                <span className="status-dot" />
                {STATUS_LABELS[status]}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )
    : null

  return (
    <div className={`status-select-wrap status-select-wrap--${size}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`status-badge status-badge--${value} status-badge--${size}`}
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dot" />
        {STATUS_LABELS[value]}
        <span className="status-chevron">{open ? '▴' : '▾'}</span>
      </button>
      {dropdown}
    </div>
  )
}
