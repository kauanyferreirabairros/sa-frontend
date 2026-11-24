import { useEffect } from 'react'

export default function FeedbackToast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(onClose, type === 'error' ? 7000 : 4000)
    return () => window.clearTimeout(timer)
  }, [message, type, onClose])

  if (!message) return null

  return (
    <div className={`toast toast--${type}`} role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}>
      <span className="toast-indicator" aria-hidden="true" />
      <p>{message}</p>
      <button type="button" aria-label="Fechar aviso" onClick={onClose}>×</button>
    </div>
  )
}
