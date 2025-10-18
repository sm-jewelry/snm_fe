// import React from 'react'

// export default function HomePage() {
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <h1>Welcome to NQD Fashion Store</h1>
//       <p>Explore our categories above.</p>
//     </div>
//   )
// }

import React from 'react'
import CircleMenu from '../components/headers/CircleMenu'
import Collections from '../components/collections/Collections'
import Seo from "../components/common/Seo";

const Home: React.FC = () => {
  return (
    <>
      <Seo
        title="Home - SNM Fashion Store"
        description="Discover the latest trends in fashion at SNM Fashion Store. Shop our new arrivals and exclusive collections today!"
        ogTitle="Home - SNM Fashion Store"
        ogDescription="Discover the latest trends in fashion at SNM Fashion Store. Shop our new arrivals and exclusive collections today!"
        ogType="website"
        ogImage='assets/GreeneyeLandscape.png'
      />
      <CircleMenu />
      <Collections />
    </>
  )
}

export default Home
