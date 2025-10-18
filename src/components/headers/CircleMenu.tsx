import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const circles = [
  { title: 'New Arrivals', src: '/images/wm_categories_1.avif', href: '/products/new-arrivals' },
  { title: 'Best Sellers', src: '/images/wm_categories_2.avif', href: '/best' },
  { title: 'Top Rated', src: '/images/wm_categories_3.avif', href: '/top' },
  { title: 'Brands We Love', src: '/images/wm_categories_4.avif', href: '/brands' },
]

const CircleMenu: React.FC = () => (
  <div className="circle-menu">
    {circles.map(c => (
      <Link key={c.title} href={c.href} className="circle-item">
        <div className="circle-image">
          <Image src={c.src} alt={c.title} width={96} height={96} />
        </div>
        <span style={{ marginTop: '8px', fontSize: '14px' }}>{c.title}</span>
      </Link>
    ))}
  </div>
  
)

export default CircleMenu
