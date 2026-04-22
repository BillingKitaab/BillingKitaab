"use client";
import React from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { langText } from '@/lib/langText'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
  const { language } = useLanguage();
  return (
    <div className='w-full bg-[#2f2f33] px-6 sm:px-10 py-12'>

      {/* Top Section */}
      <div className='flex flex-col sm:flex-row justify-between gap-10'>

        {/* Logo + Tagline */}
        <div className='flex flex-col gap-3'>
          <img
            src="/logo/smart.svg"
            alt="BillingKitaab Logo"
            className="h-10 w-auto object-contain mb-2"
          />
          <p className='text-xs text-[#f5f6f7]/40'>Premium billing for modern India.</p>
          <p className='text-xs text-[#f5f6f7]/40'>Built to last.</p>
        </div>

        {/* Links */}
        <div className='flex flex-wrap gap-10 sm:gap-16'>

          {/* Product */}
          <div className='flex flex-col gap-3'>
            <p className='text-[10px] tracking-widest text-[#D4B483]/70 uppercase'>{langText[language].product}</p>
            <Link href='/features' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].features}</Link>
            <Link href='/pricing' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].pricingPage}</Link>
          </div>

          {/* Company */}
          <div className='flex flex-col gap-3'>
            <p className='text-[10px] tracking-widest text-[#D4B483]/70 uppercase'>{langText[language].company}</p>
            <Link href='/briefaboutus' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].aboutUs}</Link>
            <Link href='/contact' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].contactPage}</Link>
          </div>

          {/* Support */}
          <div className='flex flex-col gap-3'>
            <p className='text-[10px] tracking-widest text-[#D4B483]/70 uppercase'>{langText[language].support}</p>
            <Link href='/help' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].help}</Link>
            <Link href='/terms' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].terms}</Link>
            <Link href='/privacy' className='text-sm text-[#f5f6f7]/60 hover:text-[#f5f6f7] transition-colors'>{langText[language].policy}</Link>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className='border-t border-[#f5f6f7]/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>

        {/* Copyright */}
        <p className='text-xs text-[#f5f6f7]/30 text-center sm:text-left'>
          © 2026 <span className='text-[#f5f6f7]/60'>BillingKitaab.</span> All rights reserved.
        </p>

        {/* Bottom Links */}
        <div className='flex flex-wrap justify-center gap-6'>
          <Link href='/privacy' className='text-xs text-[#f5f6f7]/30 hover:text-[#f5f6f7] transition-colors'>{langText[language].privacy}</Link>
          <Link href='/terms' className='text-xs text-[#f5f6f7]/30 hover:text-[#f5f6f7] transition-colors'>{langText[language].terms}</Link>
          <Link href='/gst' className='text-xs text-[#f5f6f7]/30 hover:text-[#f5f6f7] transition-colors'>{langText[language].gst}</Link>
        </div>

      </div>
    </div>
  )
}

export default Footer