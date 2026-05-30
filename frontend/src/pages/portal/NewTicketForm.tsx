import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useCategories } from '../../hooks/useCategories'
import type { Priority, TicketRead } from '../../types/ticket'

interface TicketCreate {
  title: string
  description: string
  priority: Priority
  channel: 'web'
  category_id?: number
}

interface Props {
  onSuccess: (ticket: TicketRead) => void
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#3B82F6' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#FF4713' },
  { value: 'critical', label: 'Critical', color: '#AD1164' },
]

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1.5px solid #E5E5E5',
  fontSize: 14,
  color: '#262626',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'Inter, system-ui, sans-serif',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#262626',
  marginBottom: 6,
}

export default function NewTicketForm({ onSuccess }: Props) {
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (body: TicketCreate) =>
      api.post<TicketRead>('/tickets', body).then(r => r.data),
    onSuccess: ticket => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setCategoryId(undefined)
      onSuccess(ticket)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    mutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
      channel: 'web',
      ...(categoryId ? { category_id: categoryId } : {}),
    })
  }

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !mutation.isPending

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Gradient top border */}
      <div
        style={{
          height: 3,
          background: 'linear-gradient(135deg, #FF4713, #AD1164)',
        }}
      />

      <div style={{ padding: '24px 24px 28px' }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0A0A0A',
            marginBottom: 4,
            letterSpacing: '-0.01em',
          }}
        >
          Submit a Request
        </h2>
        <p style={{ fontSize: 13, color: '#A3A3A3', marginBottom: 24, lineHeight: 1.5 }}>
          Describe your issue and we'll get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>
              What can we help you with?
              <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
              placeholder="Brief summary of your issue"
              maxLength={200}
              style={{
                ...inputBase,
                borderColor: focusedField === 'title' ? '#FF4713' : '#E5E5E5',
                boxShadow: focusedField === 'title' ? '0 0 0 3px rgba(255,71,19,0.08)' : 'none',
              }}
            />
            <div style={{ fontSize: 11, color: '#C0C0C0', marginTop: 4, textAlign: 'right' }}>
              {title.length}/200
            </div>
          </div>

          {/* Category + Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={categoryId ?? ''}
                onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                onFocus={() => setFocusedField('category')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputBase,
                  borderColor: focusedField === 'category' ? '#FF4713' : '#E5E5E5',
                  boxShadow: focusedField === 'category' ? '0 0 0 3px rgba(255,71,19,0.08)' : 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                }}
              >
                <option value="">No category</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                onFocus={() => setFocusedField('priority')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputBase,
                  borderColor: focusedField === 'priority' ? '#FF4713' : '#E5E5E5',
                  boxShadow: focusedField === 'priority' ? '0 0 0 3px rgba(255,71,19,0.08)' : 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                  color: PRIORITIES.find(p => p.value === priority)?.color ?? '#262626',
                  fontWeight: 600,
                }}
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>
              Description
              <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setFocusedField('desc')}
              onBlur={() => setFocusedField(null)}
              placeholder="Please describe the issue in detail — include any error messages, steps to reproduce, or context that may help."
              rows={5}
              style={{
                ...inputBase,
                resize: 'vertical',
                minHeight: 110,
                lineHeight: 1.6,
                borderColor: focusedField === 'desc' ? '#FF4713' : '#E5E5E5',
                boxShadow: focusedField === 'desc' ? '0 0 0 3px rgba(255,71,19,0.08)' : 'none',
              }}
            />
          </div>

          {/* Error */}
          {mutation.isError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                fontSize: 13,
                color: '#DC2626',
              }}
            >
              Something went wrong. Please try again.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: '11px 24px',
              borderRadius: 8,
              border: 'none',
              background: canSubmit
                ? 'linear-gradient(135deg, #FF4713, #AD1164)'
                : '#E5E5E5',
              color: canSubmit ? '#fff' : '#A3A3A3',
              fontSize: 14,
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.15s, transform 0.1s',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={e => { if (canSubmit) e.currentTarget.style.opacity = '0.92' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            onMouseDown={e => { if (canSubmit) e.currentTarget.style.transform = 'scale(0.985)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {mutation.isPending ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Submitting…
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
