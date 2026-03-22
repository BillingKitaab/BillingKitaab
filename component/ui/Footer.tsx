import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
  return (
    <div className='w-full bg-[#2f2f33] px-6 sm:px-10 py-12'>

      {/* Top Section */}
      <div className='flex flex-col sm:flex-row justify-between gap-10'>

        {/* Logo + Tagline */}
        <div className='flex flex-col gap-3'>
          <Image
            src="/logo/smart.png"
            alt="InvoiceLux Logo"
            width={120}
            height={50}
            className='object-contain'
          />
          <p className='text-xs text-[#f5f6f7]/40'>Premium billing for modern India.</p>
          <p className='text-xs text-[#f5f6f7]/40'>Built to last.</p>
        </div>

        {/* Links */}
        <div className='flex flex-wrap gap-10 sm:gap-16'>

          {/* Product */}
          <div className='flex flex-col gap-3'>
            <p className='text-[10px] tracking-widest text-[#D4B483]/70 uppercase'>Product</p>
            <Link href='#' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>Services</Link>
            <Link href='#' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>Pricing</Link>
          </div>

          {/* Company */}
          <div className='flex flex-col gap-3'>
            <p className='text-[10px] tracking-widest text-[#D4B483]/70 uppercase'>Company</p>
            <Link href='#' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>About Us</Link>
            <Link href='#' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>Contact</Link>
          </div>

          {/* Support */}
          <div className='flex flex-col gap-3'>
            <p className='text-[10px] tracking-widest text-[#D4B483]/70 uppercase'>Support</p>
            <Link href='#' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>Help Centre</Link>
            <Link href='#' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>WhatsApp Us</Link>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className='border-t border-[#f5f6f7]/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>

        {/* Copyright */}
        <p className='text-xs text-[#f5f6f7]/30 text-center sm:text-left'>
          © 2026 <span className='text-[#f5f6f7]/60'>Smartbill.</span> All rights reserved.
        </p>

        {/* Bottom Links */}
        <div className='flex flex-wrap justify-center gap-6'>
          <Link href='#' className='text-xs text-[#f5f6f7]/30 hover:text-[#f5f6f7] transition-colors'>Privacy Policy</Link>
          <Link href='#' className='text-xs text-[#f5f6f7]/30 hover:text-[#f5f6f7] transition-colors'>Terms of Use</Link>
          <Link href='#' className='text-xs text-[#f5f6f7]/30 hover:text-[#f5f6f7] transition-colors'>GST Policy</Link>
        </div>

      </div>
    </div>
  )
}

export default Footer