import React from 'react'
import Link from 'next/link'
import { FileText, Users, BarChart3, Gift } from 'lucide-react'

const BriefAboutus = () => {
  return (
    <div className='w-full bg-gradient-to-br from-[#f5f6f7] via-[#D4B483]/20 to-[#3a6f77]/30 relative overflow-x-hidden py-8 sm:py-12 md:py-16'>
      {/* Top Heading */}
      <div className='w-full px-4 mb-12 mt-15 sm:mt-9'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#2f2f33] text-center leading-tight max-w-4xl mx-auto'>
          Billig Kitaab helps make your business easier and builds trust with your customers.
        </h1>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start px-4 pb-8'>
        
        {/* Left Side - Content */}
        <div className='space-y-6'>
          
          {/* About Section */}
          <div className='space-y-2'>
            <h1 className='text-3xl sm:text-4xl font-serif font-bold text-[#2f2f33] leading-tight'>About <span className='text-[#D4B483]'>Billing Kitaab</span></h1>
            <p className='text-sm sm:text-base text-[#2f2f33]/80 leading-relaxed'>
              Billing Kitaab is a digital platform built to simplify small business management. It helps shopkeepers move beyond manual receipts and ledgers by offering a clean, professional, and easy‑to‑use online solution. Whether you run an electronics shop, clothing store, or retail outlet, <span className='font-semibold text-[#3a6f77]'>Billing Kitaab makes your business smarter and more efficient.</span>
            </p>
          </div>

          {/* Why Choose Section */}
          <div className='space-y-3'>
            <h2 className='text-xl sm:text-2xl md:text-2xl font-serif font-bold text-[#2f2f33]'>Why Choose Billing Kitaab</h2>
            <div className='space-y-2'>
              <div className='flex gap-4'>
                <div className='w-2 h-2 bg-[#D4B483] rounded-full flex-shrink-0 mt-2'></div>
                <div>
                  <p className='text-xs sm:text-sm font-semibold text-[#2f2f33]'>Simplify Operations</p>
                  <p className='text-xs text-[#2f2f33]/70'>Generate invoices, manage customers, and track inventory all in one place.</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='w-2 h-2 bg-[#3a6f77] rounded-full flex-shrink-0 mt-2'></div>
                <div>
                  <p className='text-xs sm:text-sm font-semibold text-[#2f2f33]'>Build Customer Trust</p>
                  <p className='text-xs text-[#2f2f33]/70'>Professional records and transparent billing strengthen your credibility.</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='w-2 h-2 bg-[#D4B483] rounded-full flex-shrink-0 mt-2'></div>
                <div>
                  <p className='text-xs sm:text-sm font-semibold text-[#2f2f33]'>Gain Insights</p>
                  <p className='text-xs text-[#2f2f33]/70'>Access sales reports, profit tracking, and business analytics to grow strategically.</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='w-2 h-2 bg-[#3a6f77] rounded-full flex-shrink-0 mt-2'></div>
                <div>
                  <p className='text-xs sm:text-sm font-semibold text-[#2f2f33]'>Affordable Plans</p>
                  <p className='text-xs text-[#2f2f33]/70'>Start free for 30 days, then continue with budget‑friendly subscriptions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Helps Section */}
          <div className='space-y-2'>
            <h2 className='text-xl sm:text-2xl md:text-2xl font-serif font-bold text-[#2f2f33]'>How It Helps Your Business</h2>
            <div className='space-y-2'>
              <div className='bg-[#2f2f33]/5 backdrop-blur-sm border border-[#3a6f77]/20 rounded-lg p-3'>
                <p className='text-xs sm:text-sm text-[#2f2f33]'><span className='font-bold text-[#D4B483]'>Save Time</span> – No more handwritten receipts or calculation errors.</p>
              </div>
              <div className='bg-[#3a6f77]/5 backdrop-blur-sm border border-[#D4B483]/20 rounded-lg p-3'>
                <p className='text-xs sm:text-sm text-[#2f2f33]'><span className='font-bold text-[#3a6f77]'>Boost Sales</span> – Faster billing means serving more customers efficiently.</p>
              </div>
              <div className='bg-[#2f2f33]/5 backdrop-blur-sm border border-[#3a6f77]/20 rounded-lg p-3'>
                <p className='text-xs sm:text-sm text-[#2f2f33]'><span className='font-bold text-[#D4B483]'>Grow Professionally</span> – Present your shop as modern, reliable, and customer‑friendly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Working/Visual */}
        <div className='flex flex-col items-center justify-center'>
          <img src='/logo/contactus.png' alt='Billing Kitaab' className='w-full max-w-xs sm:max-w-sm md:max-w-md h-auto rounded-2xl mb-6' />
          <div className='w-full grid grid-cols-2 gap-2 sm:gap-3 md:gap-4'>
            <div className='bg-gradient-to-br from-[#D4B483] to-[#D4B483]/80 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white flex flex-col items-center'>
              <FileText size={24} className='mb-2 sm:mb-3' />
              <p className='text-xs sm:text-xs md:text-sm font-semibold mb-1'>Invoice</p>
              <p className='text-xs sm:text-sm font-bold text-center'>Billing</p>
            </div>
            <div className='bg-gradient-to-br from-[#3a6f77] to-[#3a6f77]/80 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white flex flex-col items-center'>
              <Users size={24} className='mb-2 sm:mb-3' />
              <p className='text-xs sm:text-xs md:text-sm font-semibold mb-1'>Customer</p>
              <p className='text-xs sm:text-sm font-bold text-center'>Trust</p>
            </div>
            <div className='bg-gradient-to-br from-[#2f2f33] to-[#2f2f33]/80 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white flex flex-col items-center'>
              <BarChart3 size={24} className='mb-2 sm:mb-3' />
              <p className='text-xs sm:text-xs md:text-sm font-semibold mb-1'>Analytics</p>
              <p className='text-xs sm:text-sm font-bold text-center'>Insights</p>
            </div>
            <div className='bg-gradient-to-br from-[#f5f6f7] border-2 border-[#3a6f77] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col items-center'>
              <Gift size={24} className='mb-2 sm:mb-3 text-[#3a6f77]' />
              <p className='text-xs sm:text-xs md:text-sm font-semibold text-[#3a6f77] mb-1'>Easy</p>
              <p className='text-xs sm:text-sm font-bold text-[#2f2f33] text-center'>Free</p>
            </div>
          </div>
        </div>

      </div>

      <div className='w-full px-4 text-center text-xs sm:text-sm text-[#2f2f33]/80'>
        If you have any enquiry, please{' '}
        <Link href='/contact' className='text-blue-600 underline underline-offset-2'>
          Contact here
        </Link>
        .
      </div>
    </div>
  )
}

export default BriefAboutus
