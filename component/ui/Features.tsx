"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

const Features = () => {
  const [ctaHref, setCtaHref] = useState('/register')

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCtaHref(session ? '/dashboard' : '/register')
    }

    checkSession()
  }, [])

  const featureGroups = [
    {
      title: 'Billing Made Easy',
      accent: 'from-[#D4B483] to-[#D4B483]/80',
      items: [
        {
          name: 'Instant Invoicing',
          description: 'Auto-calculated, tax-inclusive invoices with customer details.',
        },
        {
          name: 'POS Integration',
          description: 'Accept multiple payment methods and print receipts instantly.',
        },
        {
          name: 'Customer Management',
          description: 'Track purchase history, manage credit accounts, and send invoices via SMS/email.',
        },
      ],
    },
    {
      title: 'Smart Inventory Management',
      accent: 'from-[#3a6f77] to-[#3a6f77]/80',
      items: [
        {
          name: 'Stock Tracking',
          description: 'Real-time inventory updates as sales happen.',
        },
        {
          name: 'Low Stock Alerts',
          description: 'Notifications when items run low.',
        },
        {
          name: 'Product Catalog',
          description: 'Organize products by category, price, and variants.',
        },
        {
          name: 'Barcode Scanning',
          description: 'Add or sell items instantly using barcode.',
        },
      ],
    },
    {
      title: 'Sales & Business Analytics',
      accent: 'from-[#2f2f33] to-[#2f2f33]/90',
      items: [
        {
          name: 'Daily Sales Reports',
          description: 'One-tap view of total sales, cash vs credit, and top-selling items.',
        },
        {
          name: 'Profit & Loss Tracking',
          description: 'Monitor margins, expenses, and net profit trends.',
        },
        {
          name: 'Business Insights',
          description: 'Discover peak hours, best customers, and seasonal patterns.',
        },
      ],
    },
  ]

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-[#f5f6f7] via-[#D4B483]/20 to-[#3a6f77]/30 px-4 pt-28 pb-10 sm:px-6 sm:pt-32 md:px-10 md:pt-36 lg:px-14'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-8 sm:mb-10'>
          <h1 className='mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-[#2f2f33]'>Powerful Features for Modern Businesses</h1>
          <p className='mt-3 text-sm sm:text-base text-[#2f2f33]/80 max-w-3xl mx-auto leading-relaxed'>Everything you need to manage billing, inventory, and business growth from one smart dashboard.</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'>
          {featureGroups.map((group) => (
            <div key={group.title} className='bg-[#f5f6f7]/85 backdrop-blur-sm border border-[#2f2f33]/10 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(47,47,51,0.08)]'>
              <div className={`bg-gradient-to-r ${group.accent} rounded-xl px-4 py-3 mb-4`}>
                <h2 className='text-base sm:text-lg font-bold font-serif text-[#f5f6f7]'>{group.title}</h2>
              </div>

              <div className='space-y-3'>
                {group.items.map((item) => (
                  <div key={item.name} className='bg-white/60 border border-[#2f2f33]/10 rounded-lg p-3'>
                    <h3 className='text-sm sm:text-base font-semibold text-[#2f2f33]'>{item.name}</h3>
                    <p className='text-xs sm:text-sm text-[#2f2f33]/75 leading-relaxed mt-1'>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 sm:mt-10  text-center'>
          <p className='mb-3 text-sm sm:text-base font-semibold text-[#2f2f33]'>
            Start Free Now To Grow Your Business{' '}
            <Link href={ctaHref} className='text-blue-600 hover:text-blue-700 underline underline-offset-2'>
              Click
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Features
