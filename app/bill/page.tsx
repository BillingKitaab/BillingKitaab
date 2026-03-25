import Invoicebill from '@/component/ui/Invoicebill'
import Sidebar from '@/component/ui/Sidebar'
import React from 'react'

const page = () => {
  return (
    <div className='flex'>
        <Sidebar />
      <Invoicebill />
    </div>
  )
}

export default page
