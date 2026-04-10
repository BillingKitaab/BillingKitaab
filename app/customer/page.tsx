import Customer from '@/component/ui/Customer'
import Sidebar from '@/component/ui/Sidebar'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div className='flex'>
        <Sidebar />
      <Suspense fallback={null}>
        <Customer />
      </Suspense>
    </div>
  )
}

export default page
