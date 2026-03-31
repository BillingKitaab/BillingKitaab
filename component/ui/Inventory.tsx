"use client"

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const Inventory = () => {
  const router = useRouter()
  const [showAddedPopup, setShowAddedPopup] = useState(false)
  const [popupKey, setPopupKey] = useState(0)
  const [stockQuantity, setStockQuantity] = useState('')
  const [lastAddedQuantity, setLastAddedQuantity] = useState('0')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')

  const purchase = Number(purchasePrice || 0)
  const selling = Number(sellingPrice || 0)
  const quantity = Number(stockQuantity || 0)
  const perUnitProfit = selling - purchase
  const totalEstimatedProfit = perUnitProfit * quantity

  useEffect(() => {
    if (popupKey === 0) return

    setShowAddedPopup(true)
    const timer = setTimeout(() => {
      setShowAddedPopup(false)
    }, 2200)

    return () => clearTimeout(timer)
  }, [popupKey])

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLastAddedQuantity(stockQuantity || '0')
    setPopupKey((prev) => prev + 1)
    e.currentTarget.reset()
    setStockQuantity('')
    setPurchasePrice('')
    setSellingPrice('')
  }

  return (
    <div className='min-h-screen lg:h-[100dvh] lg:overflow-hidden w-full bg-gradient-to-br from-[#f5f6f7] via-[#D4B483]/15 to-[#3a6f77]/20 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:py-4'>
      <AnimatePresence>
        {showAddedPopup && (
          <motion.div
            key={popupKey}
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className='fixed right-4 top-5 z-50 w-[90vw] max-w-sm rounded-xl border border-[#D4B483]/50 bg-[#f5f6f7] px-4 py-3 shadow-[0_10px_28px_rgba(47,47,51,0.18)]'
          >
            <p className='text-sm font-bold text-[#2f2f33]'>Product added successfully</p>
            <p className='mt-1 text-xs text-[#2f2f33]/70'>{lastAddedQuantity} unit(s) added to your stock list.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='mx-auto mt-2 sm:mt-3 lg:mt-0 w-full max-w-3xl'>
        <div className='text-center'>
          <h1 className='text-3xl sm:text-4xl lg:text-3xl font-serif font-bold text-[#2f2f33]'>Add New Item</h1>
          <p className='mt-2 lg:mt-1 text-sm sm:text-base lg:text-sm text-[#2f2f33]/70 font-medium'>Register a new product to your inventory in seconds.</p>
        </div>

        <div className='mt-6 sm:mt-8 lg:mt-4 rounded-2xl border border-[#2f2f33]/10 bg-[#f5f6f7]/95 shadow-[0_12px_35px_rgba(47,47,51,0.10)] p-4 sm:p-6 md:p-7 lg:p-5'>
          <form onSubmit={handleAddProduct} className='space-y-4 sm:space-y-5 lg:space-y-3'>
            <div>
              <label className='mb-2 lg:mb-1 block text-sm font-semibold text-[#2f2f33]'>Product Name</label>
              <input
                type='text'
                placeholder='e.g. Industrial Grade Steel Pipe'
                required
                className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] placeholder:text-[#2f2f33]/45 outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='mb-2 lg:mb-1 block text-sm font-semibold text-[#2f2f33]'>SKU Code</label>
                <input
                  type='text'
                  placeholder='e.g. SKU-1024'
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] placeholder:text-[#2f2f33]/45 outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'
                />
              </div>
              <div>
                <label className='mb-2 lg:mb-1 block text-sm font-semibold text-[#2f2f33]'>Purchase Price (₹)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder='0.00'
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] placeholder:text-[#2f2f33]/45 outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='mb-2 lg:mb-1 block text-sm font-semibold text-[#2f2f33]'>Stock Quantity</label>
                <input
                  type='number'
                  min='0'
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder='0'
                  required
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] placeholder:text-[#2f2f33]/45 outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'
                />
              </div>

              <div>
                <label className='mb-2 lg:mb-1 block text-sm font-semibold text-[#2f2f33]'>Category</label>
                <select defaultValue='' required className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'>
                  <option value='' disabled>Select category</option>
                  <option>Electronics</option>
                  <option>Groceries</option>
                  <option>Clothing</option>
                  <option>Hardware</option>
                  <option>Stationery</option>
                </select>
              </div>
            </div>

            <div>
              <label className='mb-2 lg:mb-1 block text-sm font-semibold text-[#2f2f33]'>Selling Price (₹)</label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder='0.00'
                required
                className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] placeholder:text-[#2f2f33]/45 outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'
              />
            </div>

            <div className='rounded-lg border border-[#D4B483]/40 bg-[#D4B483]/10 p-3 sm:p-4 lg:p-2.5'>
              <p className='text-xs sm:text-sm font-semibold text-[#2f2f33]'>Profit Preview</p>
              <div className='mt-2 lg:mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <p className='text-xs sm:text-sm text-[#2f2f33]/80'>
                  Per Unit Profit:{' '}
                  <span className={`font-bold ${perUnitProfit >= 0 ? 'text-[#3a6f77]' : 'text-red-600'}`}>
                    ₹{perUnitProfit.toFixed(2)}
                  </span>
                </p>
                <p className='text-xs sm:text-sm text-[#2f2f33]/80'>
                  Total Estimated Profit:{' '}
                  <span className={`font-bold ${totalEstimatedProfit >= 0 ? 'text-[#3a6f77]' : 'text-red-600'}`}>
                    ₹{totalEstimatedProfit.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <div className='mb-2 flex items-center justify-between'>
                <label className='block text-sm font-semibold text-[#2f2f33]'>Supplier</label>
                <span className='text-[11px] font-bold tracking-wide text-[#2f2f33]/40'>OPTIONAL</span>
              </div>
              <input
                type='text'
                placeholder='Enter supplier name'
                className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 lg:py-2 text-sm text-[#2f2f33] placeholder:text-[#2f2f33]/45 outline-none focus:border-[#3a6f77] focus:ring-2 focus:ring-[#3a6f77]/15'
              />
            </div>

            <button type='submit' className='mt-1 w-full rounded-lg bg-[#3a6f77] px-4 py-3 lg:py-2 text-sm sm:text-base lg:text-sm font-bold text-[#f5f6f7] transition-colors duration-200 hover:bg-[#2f2f33]'>
              Add to Stock
            </button>

            <button type='button' onClick={() => router.push('/dashboard')} className='w-full text-center text-sm lg:text-xs font-semibold text-[#2f2f33]/60 transition-colors duration-200 hover:text-[#2f2f33]'>
              Cancel and go back
            </button>
          </form>
        </div>

        <p className='mx-auto mt-6 lg:mt-3 max-w-xl text-center text-xs sm:text-sm lg:text-xs text-[#2f2f33]/40'>
          By adding this item, it will be immediately available in your inventory records for billing and stock tracking.
        </p>
      </div>
    </div>
  )
}

export default Inventory
