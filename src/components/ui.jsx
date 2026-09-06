import { useEffect, useRef } from 'react'

const cx = (...parts) => parts.filter(Boolean).join(' ')

export function Button({
  as: As = 'button',
  variant = 'default',
  size = 'md',
  className,
  ...props
}) {
  const variants = {
    default:
      'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 hover:border-stone-400',
    primary:
      'bg-stone-900 text-white border border-stone-900 hover:bg-stone-800 shadow-sm',
    ghost: 'text-stone-600 border border-transparent hover:bg-stone-200/70',
    danger: 'text-red-700 border border-transparent hover:bg-red-50',
  }
  const sizes = {
    sm: 'h-7 px-2 text-xs gap-1.5 rounded-md',
    md: 'h-9 px-3 text-sm gap-2 rounded-lg',
    lg: 'h-10 px-4 text-sm gap-2 rounded-lg',
  }
  return (
    <As
      className={cx(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/30 focus-visible:ring-offset-1',
        'disabled:opacity-45 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
          {label}
        </span>
        {hint && <span className="text-[11px] text-stone-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const controlBase =
  'w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 ' +
  'placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-900/10'

export const Input = ({ className, ...props }) => (
  <input className={cx(controlBase, 'h-9', className)} {...props} />
)

export const Select = ({ className, ...props }) => (
  <select className={cx(controlBase, 'h-9 pr-8 appearance-none bg-no-repeat', className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%2378716c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
      backgroundPosition: 'right 0.6rem center',
      backgroundSize: '12px',
      ...props.style,
    }}
    {...props}
  />
)

export const Textarea = ({ className, ...props }) => (
  <textarea className={cx(controlBase, 'py-2 leading-relaxed resize-y', className)} {...props} />
)

export function Range({ label, value, min, max, step = 1, suffix = '', onChange }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
          {label}
        </span>
        <span className="font-mono text-[11px] text-stone-500">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-800"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-lg px-1 py-1.5 text-left hover:bg-stone-100/70"
    >
      <span
        className={cx(
          'mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
          checked ? 'border-stone-900 bg-stone-900' : 'border-stone-300 bg-stone-200',
        )}
      >
        <span
          className={cx(
            'h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-stone-800">{label}</span>
        {description && (
          <span className="block text-xs leading-snug text-stone-500">{description}</span>
        )}
      </span>
    </button>
  )
}

export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={cx('inline-flex rounded-lg border border-stone-300 bg-stone-100 p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            value === opt.value
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-800',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 'max-w-2xl' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/25 p-4 backdrop-blur-[2px] sm:p-10"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'animate-fade-in w-full rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto scroll-slim px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-stone-200 bg-stone-50/70 px-5 py-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export const Divider = ({ label }) =>
  label ? (
    <div className="my-4 flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-stone-200" />
    </div>
  ) : (
    <hr className="my-4 border-stone-200" />
  )

export { cx }
