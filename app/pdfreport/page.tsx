import PDFreport from '@/component/ui/PDFreport'
import Sidebar from '@/component/ui/Sidebar'
import RecentReportsPage from './reports/page'
import React from 'react'

const page = () => {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <PDFreport />
        <RecentReportsPage />
      </div>
    </div>
  )
}

export default page

