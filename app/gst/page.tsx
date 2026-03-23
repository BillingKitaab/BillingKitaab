import Navbar from '@/component/ui/Navbar'
import Footer from '@/component/ui/Footer'
import React from 'react'

const Gst = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 px-6 sm:px-10 max-w-4xl mx-auto w-full mb-20 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-serif text-[#2f2f33] mb-6">GST Compliance Policy</h1>
        <div className="text-[#2f2f33]/80 space-y-6 leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-[#2f2f33]/5">
          <p>
            BillingKitaab is engineered from the ground up to support localized Indian taxation models gracefully integrating the standard Goods and Services Tax framework computations accurately out of the box.
          </p>
          
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#D4B483]">Tax Implementations</h2>
            <p>
              Invoices seamlessly differentiate between nested <strong>CGST</strong>, <strong>SGST</strong>, and <strong>IGST</strong> metrics automatically computing regional and international boundaries logically displaying output ratios natively transparently over dispatched PDF reports.
            </p>
            
            <h2 className="text-2xl font-bold text-[#D4B483]">Merchant Validity</h2>
            <p>
              You maintain strictly the liability configuring precise and valid GSTIN identifiers corresponding accurately with your registered PAN domains avoiding legal or statutory conflicts upon physical or remote auditing structures manually.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
export default Gst
