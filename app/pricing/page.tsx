import PlanBilling from '@/component/ui/Planbilling'
import Navbar from '@/component/ui/Navbar'
import React from 'react'

const Page = () => {
  return (
    <div className='min-h-screen flex justify-center pt-20'>
      <Navbar />
      <PlanBilling />
    </div>
  )
}

export default Page