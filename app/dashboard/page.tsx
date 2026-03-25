import Dashboard from '@/component/ui/Dashboard'
import Sidebar from '@/component/ui/Sidebar'
import React from 'react'

const page = () => {
  return (
    <div className="flex">
      <Sidebar />
      <Dashboard />
    </div>
  )
}

export default page