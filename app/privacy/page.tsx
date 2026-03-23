import Navbar from '@/component/ui/Navbar'
import Footer from '@/component/ui/Footer'
import React from 'react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 px-6 sm:px-10 max-w-4xl mx-auto w-full mb-20 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-serif text-[#2f2f33] mb-6">Privacy Policy</h1>
        <p className="text-xs text-[#3a6f77] font-semibold mb-8 uppercase tracking-widest">Last Updated: March 2026</p>
        
        <div className="text-[#2f2f33]/80 space-y-6 leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-[#2f2f33]/5">
          <p>
            At <strong>BillingKitaab</strong>, your privacy and security are our highest priorities. We understand that your billing data contains sensitive financial and personal information. This Privacy Policy details how we collect, use, and protect your enterprise data.
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">1. Data Collection</h2>
          <p>
            When utilizing BillingKitaab, we collect information you purposefully provide, including your business name, contact information, client endpoints, and financial invoice parameters specifically designed for application functionalities.
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">2. End-to-End Encryption</h2>
          <p>
            Your information remains strictly secure resting on our distributed backend architectures. Billing data is explicitly secured inside strictly authenticated logical perimeters. Only you maintain operational execution over your metrics.
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">3. Third Party Integrations</h2>
          <p>
            While generating WhatsApp drops and dispatching structured Emails, BillingKitaab utilizes strictly vetted trusted infrastructures passing information dynamically avoiding native archival cache exposures securely handling payloads.
          </p>

          <h2 className="text-2xl font-serif text-[#2f2f33] mt-8 mb-4 border-b pb-2">4. Your Control</h2>
          <p>
            You unconditionally reserve the total right to amend, access, copy, or eradicate your stored enterprise identity. Contact our security response networks at <a href="mailto:privacy@billingkitaab.com" className="text-[#D4B483] hover:underline">privacy@billingkitaab.com</a>.
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
export default Privacy
