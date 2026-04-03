import PDFreport from '@/component/ui/PDFreport'
import Sidebar from '@/component/ui/Sidebar'
import RecentReportsPage from './reports/page'
import React from 'react'

const page = () => {
  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-y-auto'>
        <PDFreport />
        <RecentReportsPage />
      </div>
    </div>
  )
}

export default page

