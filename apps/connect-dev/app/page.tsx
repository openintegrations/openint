'use client'

import {useState} from 'react'
import {OpenIntConnectEmbed} from '../../../kits/connect/src/embed-react'

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const token = process.env['NEXT_PUBLIC_OPENINT_TOKEN']

  return (
    <div style={{padding: '1.5rem'}}>
      <h1
        style={{marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold'}}>
        Embed React connect portal
      </h1>

      <div
        style={{
          margin: '1rem',
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
        }}>
        <label
          htmlFor="theme-toggle"
          style={{marginRight: '1.5rem', fontSize: '0.875rem'}}>
          Theme: {theme}
        </label>
        <button
          id="theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            borderRadius: '0.25rem',
            backgroundColor: '#8066FF',
            color: 'white',
            border: '1px solid white',
            padding: '0.25rem 0.75rem',
            fontSize: '0.875rem',
            width: 'fit-content',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#6645FF')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = '#8066FF')
          }>
          Toggle Theme
        </button>
      </div>

      <OpenIntConnectEmbed
        baseUrl="http://localhost:4000"
        params={{
          token,
          view: 'manage',
          theme,
        }}
        height={500}
        width={350}
      />
    </div>
  )
}
