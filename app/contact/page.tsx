import Navbar from '@/component/ui/Navbar'
import Footer from '@/component/ui/Footer'
import Contactus from '@/component/ui/Contectus'
import React from 'react'

const Contact = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F2EC] flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto md:overflow-hidden flex items-start md:items-center justify-center pt-20 pb-4">
        <Contactus />
      </div>
    </div>
  )
}
export default Contact
