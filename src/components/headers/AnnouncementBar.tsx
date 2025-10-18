import React, { useState, useEffect } from 'react'

const messages = [
  "LIMITED TIME OFFER: FASHION SALE YOU CAN'T RESIST",
  "FREE SHIPPING AND RETURNS",
  "NEW SEASON, NEW STYLES: FASHION SALE YOU CAN'T MISS"
]

const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="announcement-bar">
      <span>{messages[index]}</span>
      <button className="announcement-close" onClick={() => setVisible(false)}>
        ×
      </button>
    </div>
  )
}

export default AnnouncementBar
