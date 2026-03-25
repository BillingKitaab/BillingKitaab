import Customer from '@/component/ui/Customer'
import Sidebar from '@/component/ui/Sidebar'
import React from 'react'

const page = () => {
  return (
    <div className='flex'>
        <Sidebar />
      <Customer />
    </div>
  )
}

export default page
