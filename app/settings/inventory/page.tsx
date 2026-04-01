import Inventory from '@/component/ui/Inventory'
import Settingsidebar from '@/component/ui/Settingsidebar'
import Sidebar from '@/component/ui/Sidebar'
import React from 'react'

const Page = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-1 gap-6">
        <Settingsidebar />
        <div className="flex-1">
          <Inventory />
        </div>
      </div>
    </div>
  )
}

export default Page
