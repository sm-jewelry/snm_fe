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
import TrendingProducts from '../components/products/TrendingProducts'
import Seo from "../components/common/Seo";

const Home: React.FC = () => {
  return (
    <>
      <Seo
        title="Home - SNM Jewelry"
        description="Discover exquisite jewelry collections at SNM. Shop our latest trending pieces, premium diamonds, and handcrafted gold ornaments."
        ogTitle="Home - SNM Jewelry"
        ogDescription="Discover exquisite jewelry collections at SNM. Shop our latest trending pieces, premium diamonds, and handcrafted gold ornaments."
        ogType="website"
        ogImage='assets/GreeneyeLandscape.png'
      />
      <CircleMenu />
      <Collections />
      <TrendingProducts />
    </>
  )
}

export default Home
