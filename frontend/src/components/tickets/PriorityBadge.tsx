import { PRIORITY_COLORS, PRIORITY_LABELS, type Priority } from '../../types/ticket'

interface Props {
  priority: Priority
  size?: 'sm' | 'md'
}

export default function PriorityBadge({ priority, size = 'sm' }: Props) {
  const color = PRIORITY_COLORS[priority]
  const label = PRIORITY_LABELS[priority]
  const dotSize = size === 'sm' ? 6 : 7

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 500,
        color: '#262626',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          boxShadow: `0 0 0 2px ${color}25`,
        }}
      />
      {label}
    </span>
  )
}
