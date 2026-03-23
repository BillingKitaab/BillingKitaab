import Navbar from '@/component/ui/Navbar'
import Footer from '@/component/ui/Footer'
import React from 'react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 px-6 sm:px-10 max-w-4xl mx-auto w-full mb-20">
        <h1 className="text-4xl sm:text-5xl font-serif text-[#2f2f33] mb-6">Terms of Use</h1>
        <p className="text-xs text-[#3a6f77] font-semibold mb-8 uppercase tracking-widest">Effective Date: March 2026</p>
        
        <div className="text-[#2f2f33]/80 space-y-6 leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-[#2f2f33]/5">
          <p>
            Welcome to BillingKitaab. By accessing our enterprise software architectures, you explicitly consent to the operational conditions defined below. 
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">1. Software License</h2>
          <p>
            BillingKitaab grants restricted access and non-transferable application utilization rights specifically governing commercial invoice transmission and data reporting purposes exclusively. You may not reverse-engineer algorithms or redistribute the core interface schemas.
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">2. Liability Restrictions</h2>
          <p>
            BillingKitaab calculates and processes taxation algorithms strictly as advisory representations. You remain fundamentally responsible for the validation of final accounting outputs before formal submissions to legal frameworks or governmental authorities.
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">3. Account Obligations</h2>
          <p>
            Registered business operators must verify their authorized standing within national frameworks. Suspicious generation of unverified, spam, or malicious PDF payloads will trigger permanent infrastructure-level termination restrictions.
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
export default Terms
