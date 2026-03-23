import Navbar from '@/component/ui/Navbar'
import Footer from '@/component/ui/Footer'
import React from 'react'

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 px-6 sm:px-10 max-w-4xl mx-auto w-full mb-20">
        <h1 className="text-4xl sm:text-5xl font-serif text-[#2f2f33] mb-6">Contact Us</h1>
        <div className="text-[#2f2f33]/80 space-y-6 leading-relaxed">
          <p>Have questions about BillingKitaab? Were here to help you revolutionize your billing process.</p>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#2f2f33]/5 mt-8">
            <h3 className="text-xl font-bold text-[#2f2f33] mb-4">Get in Touch</h3>
            <p className="mb-2"><strong>Email:</strong> [EMAIL_ADDRESS]</p>
            <p className="mb-2"><strong>Phone:</strong> +91 9129600235</p>
            <p className="mb-2"><strong>Address:</strong> Lucknow, Uttar Pradesh, India</p>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
export default Contact
