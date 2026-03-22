import Setting from '@/component/ui/Setting'
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
          <Setting />
        </div>
      </div>
    </div>
  )
}

export default Page