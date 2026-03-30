import Link from 'next/link'
import React from 'react'

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-md border border-[#D4B483] p-8 sm:p-12 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3a6f77] mb-4">
            <svg className="w-8 h-8 text-[#f5f6f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2f2f33] mb-3">Thank You</h1>
        <p className="text-[#3a6f77] text-base mb-6">
          We have received your message. We will contact you shortly.
        </p>
        <Link href="/contact" className="inline-block bg-[#3a6f77] text-[#f5f6f7] px-6 py-2.5 rounded-md font-semibold hover:bg-[#2c5359] transition cursor-pointer border border-[#D4B483]">
          Back to Contact
        </Link>
      </div>
    </div>
  )
}

export default ThankYou
