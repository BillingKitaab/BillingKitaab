import Reminder from '@/component/ui/Reminder'
import Sidebar from '@/component/ui/Sidebar'
import React from 'react'

const page = () => {
  return (
    <div className='flex'>
      <Sidebar />
      <Reminder />
    </div>
  )
}

export default page
