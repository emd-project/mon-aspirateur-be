export const C = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  surface2: '#F0EBE3',
  border: '#EDE5D8',
  borderFocus: '#C4622D',
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.1)',
  accentBorder: 'rgba(196,98,45,.3)',
  success: '#6B8F71',
  successSoft: 'rgba(107,143,113,.1)',
  successBorder: 'rgba(107,143,113,.3)',
  warning: '#C49A2D',
  warningSoft: 'rgba(196,154,45,.1)',
  warningBorder: 'rgba(196,154,45,.25)',
  error: '#B91C1C',
  errorSoft: 'rgba(185,28,28,.07)',
  errorBorder: 'rgba(185,28,28,.2)',
  inputBg: '#F5F0E8',
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 0.75rem',
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.375rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: C.muted,
  letterSpacing: '.01em',
}

export const ghostBtnStyle: React.CSSProperties = {
  padding: '0.5rem 0.875rem',
  background: 'transparent',
  border: `1px dashed ${C.border}`,
  borderRadius: 8,
  color: C.muted,
  fontSize: '0.8125rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
