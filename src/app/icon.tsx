import { ImageResponse } from 'next/og'
import { Scale } from 'lucide-react'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'hsl(265 35% 8%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(265 80% 70%)',
          borderRadius: '6px',
          padding: '4px'
        }}
      >
        <Scale />
      </div>
    ),
    {
      ...size,
    }
  )
}
