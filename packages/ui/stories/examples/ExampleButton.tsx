export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean
  /** What background color to use */
  backgroundColor?: string
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large'
  /** Button contents */
  label: string
  /** Optional click handler */
  onClick?: () => void
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  // Base button styles
  const baseStyle = {
    display: 'inline-block',
    cursor: 'pointer',
    border: 0,
    borderRadius: '3em',
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  }

  // Primary/secondary styles
  const modeStyle = primary
    ? {
        backgroundColor: backgroundColor || '#555ab9',
        color: 'white',
      }
    : {
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset',
        backgroundColor: backgroundColor || 'transparent',
        color: '#333',
      }

  // Size styles
  const sizeStyle = {
    small: {
      padding: '10px 16px',
      fontSize: '12px',
    },
    medium: {
      padding: '11px 20px',
      fontSize: '14px',
    },
    large: {
      padding: '12px 24px',
      fontSize: '16px',
    },
  }[size]

  // Combine all styles
  const buttonStyle = {
    ...baseStyle,
    ...modeStyle,
    ...sizeStyle,
  }

  return (
    <button type="button" style={buttonStyle} {...props}>
      {label}
    </button>
  )
}
