import Inventoryshow from '@/component/ui/Inventoryshow'
import Sidebar from '@/component/ui/Sidebar'
import React from 'react'

const page = () => {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='w-full'>
        <Inventoryshow />
      </div>
    </div>
  )
}

export default page
