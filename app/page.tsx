import Landing1 from '@/component/Landing1'
import Navbar from '@/component/ui/Navbar'
import React from 'react'
import Scrollbar from '../component/ui/Scrollbar'
import Services from '@/component/ui/Services'
import About from '@/component/ui/About'
import Footer from '@/component/ui/Footer'
import Planbilling from '@/component/ui/Planbilling'

const Page = () => {
  return (
    <div>
      <Navbar />
      <Landing1 />
      <Scrollbar />
      <Services />
      <div id="pricing">
        <Planbilling />
      </div>
      <About />
      <Footer />
    </div>
  )
}

export default Page
