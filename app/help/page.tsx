import Navbar from '@/component/ui/Navbar'
import Footer from '@/component/ui/Footer'
import React from 'react'

const Help = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 px-6 sm:px-10 max-w-4xl mx-auto w-full mb-20">
        <h1 className="text-4xl sm:text-5xl font-serif text-[#2f2f33] mb-6">Help Centre</h1>
        <div className="text-[#2f2f33]/80 space-y-6 leading-relaxed">
          <p>Welcome to the BillingKitaab Help Centre. Below you will find answers to frequently asked questions to get your business up and running.</p>
          
          <div className="space-y-6 mt-8 p-6 bg-white rounded-2xl shadow-sm border border-[#2f2f33]/5">
            <div>
              <h3 className="text-lg font-bold text-[#3a6f77] mb-2">How do I create a new invoice?</h3>
              <p>Navigate to your Dashboard and select Invoices, then tap New Invoice. Fill in the client details, item specifics, and save to dispatch directly via Email or WhatsApp.</p>
            </div>
            <div className="border-t border-[#f5f6f7]/50 pt-4">
              <h3 className="text-lg font-bold text-[#3a6f77] mb-2">How are reminders triggered?</h3>
              <p>Automated reminders trigger for Unpaid invoices past their stated Due Date. Customize the frequency within your Preferences.</p>
            </div>
            <div className="border-t border-[#f5f6f7]/50 pt-4">
              <h3 className="text-lg font-bold text-[#3a6f77] mb-2">How can I download PDF reports?</h3>
              <p>Generate revenue reports explicitly via the PDF Reports module located inside your Sidebar navigation.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
export default Help
