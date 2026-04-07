"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FaCheckCircle, FaEdit, FaSearch, FaTrash } from 'react-icons/fa'
import { AnimatePresence, motion } from 'framer-motion'

type Product = {
  id: number
  name: string
  sku: string
  quantity: number
  category: string
  purchasePrice: number
  sellingPrice: number
  supplier: string
  createdAt: string
}

const Inventoryshow = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddedToast, setShowAddedToast] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const [lastAddedProductName, setLastAddedProductName] = useState('')

  const totalStock = useMemo(
    () => products.reduce((sum, item) => sum + item.quantity, 0),
    [products]
  )

  const totalProducts = products.length

  useEffect(() => {
    const raw = localStorage.getItem('inventory_products')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Product[]
      if (Array.isArray(parsed)) {
        setProducts(parsed)
      }
    } catch {
      setProducts([])
    }
  }, [])

  useEffect(() => {
    const lastAddedName = sessionStorage.getItem('inventory_last_added_product')
    if (!lastAddedName) return

    setLastAddedProductName(lastAddedName)
    setToastKey((prev) => prev + 1)
    sessionStorage.removeItem('inventory_last_added_product')
  }, [])

  useEffect(() => {
    if (toastKey === 0) return

    setShowAddedToast(true)
    const timer = setTimeout(() => {
      setShowAddedToast(false)
    }, 2200)

    return () => clearTimeout(timer)
  }, [toastKey])

  const handleDeleteProduct = (productId: number) => {
    const shouldDelete = window.confirm('Delete this product?')
    if (!shouldDelete) return

    const nextProducts = products.filter((product) => product.id !== productId)
    setProducts(nextProducts)
    localStorage.setItem('inventory_products', JSON.stringify(nextProducts))
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return products

    return products.filter((item) =>
      [item.name, item.sku, item.category, item.supplier]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [products, searchTerm])

  return (
    <div className='relative w-full min-h-screen overflow-hidden bg-[#f5f6f7] p-4 sm:p-6 md:p-8'>
      <div className='pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#D4B483]/20 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#3a6f77]/15 blur-3xl' />

      <div className='relative mx-auto max-w-6xl'>
        <AnimatePresence>
          {showAddedToast && (
            <motion.div
              initial={{ opacity: 0, x: 140, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 140, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-[#D4B483] bg-[#f5f6f7] p-3 text-[#2f2f33]'
            >
              <div className='flex items-start gap-3'>
                <div className='mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#3a6f77] text-[#f5f6f7]'>
                  <FaCheckCircle className='text-xs' />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs font-bold uppercase tracking-wide text-[#3a6f77]'>Success</p>
                  <p className='mt-0.5 text-sm font-semibold text-[#2f2f33]'>Product added</p>
                  <p className='truncate text-xs text-[#2f2f33]/70'>{lastAddedProductName}</p>
                </div>
              </div>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 2.1, ease: 'linear' }}
                className='mt-2 h-1 rounded-full bg-[#D4B483]'
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className='rounded-3xl border border-[#2f2f33]/10 bg-[#f5f6f7]/95 p-5 backdrop-blur-sm sm:p-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2f2f33]'>Inventory</h1>
              <p className='mt-1 text-sm font-medium text-[#2f2f33]/70'>
                Add products and see everything you added here.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto'>
              <div className='relative w-full sm:w-80'>
                <FaSearch className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#f5f6f7]/45' />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search product, SKU, category'
                  className='w-full rounded-xl border border-[#2f2f33]/10 bg-[#2f2f33] py-2.5 pl-9 pr-3 text-sm text-[#f5f6f7] outline-none transition-colors focus:border-[#D4B483]'
                />
              </div>

              <Link
                href='/inventory/add-product'
                className='shrink-0 rounded-xl bg-[#3a6f77] px-5 py-2.5 text-sm font-bold text-[#f5f6f7] transition-colors hover:bg-[#2f2f33]'
              >
                Add Product
              </Link>
            </div>
          </div>

          <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-2xl border border-[#D4B483]/50 bg-[#D4B483]/12 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-[#2f2f33]/65'>Total Products</p>
              <p className='mt-1 text-3xl font-extrabold text-[#2f2f33]'>{totalProducts}</p>
            </div>
            <div className='rounded-2xl border border-[#3a6f77]/40 bg-[#3a6f77]/10 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-[#2f2f33]/65'>Total Stock Units</p>
              <p className='mt-1 text-3xl font-extrabold text-[#2f2f33]'>{totalStock}</p>
            </div>
            <div className='rounded-2xl border border-[#2f2f33]/15 bg-[#f5f6f7] p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-[#2f2f33]/65'>Latest Action</p>
              <p className='mt-1 text-sm font-semibold text-[#2f2f33]'>
                {products.length > 0 ? 'Product added successfully' : 'No products added yet'}
              </p>
            </div>
          </div>

          <div className='mt-7'>
            <h2 className='text-xl font-extrabold text-[#2f2f33]'>Added Products</h2>

            {products.length === 0 ? (
              <div className='mt-3 rounded-2xl border border-dashed border-[#2f2f33]/25 bg-[#f5f6f7] p-6 text-center text-sm text-[#2f2f33]/60'>
                No product added yet. Click Add Product to add your first item.
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className='mt-3 rounded-2xl border border-dashed border-[#2f2f33]/25 bg-[#f5f6f7] p-6 text-center text-sm text-[#2f2f33]/60'>
                No matching product found.
              </div>
            ) : (
              <div className='mt-3 overflow-x-auto rounded-2xl border border-[#2f2f33]/10 bg-white'>
                <table className='w-full min-w-190 bg-[#f5f6f7]'>
                  <thead className='bg-[#2f2f33] text-[#f5f6f7]'>
                    <tr>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Product</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>SKU</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Category</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Qty</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Purchase</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Selling</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Supplier</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Added At</th>
                      <th className='px-3 py-2 text-left text-xs font-semibold'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item, index) => (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-[#f5f6f7]' : 'bg-[#f5f6f7]/70'} border-b border-[#2f2f33]/5 last:border-b-0`}>
                        <td className='px-3 py-2 text-sm text-[#2f2f33] font-semibold'>{item.name}</td>
                        <td className='px-3 py-2 text-sm text-[#2f2f33]'>{item.sku || '-'}</td>
                        <td className='px-3 py-2 text-sm text-[#2f2f33]'>{item.category}</td>
                        <td className='px-3 py-2 text-sm text-[#2f2f33]'>{item.quantity}</td>
                        <td className='px-3 py-2 text-sm text-[#2f2f33]'>₹{item.purchasePrice.toFixed(2)}</td>
                        <td className='px-3 py-2 text-sm text-[#2f2f33]'>₹{item.sellingPrice.toFixed(2)}</td>
                        <td className='px-3 py-2 text-sm text-[#2f2f33]'>{item.supplier || '-'}</td>
                        <td className='px-3 py-2 text-xs text-[#2f2f33]/70'>{item.createdAt}</td>
                        <td className='px-3 py-2'>
                          <div className='flex flex-wrap gap-2'>
                            <Link
                              href={`/inventory/add-product?edit=${item.id}`}
                              className='inline-flex items-center gap-1 rounded-lg border border-[#3a6f77]/35 bg-[#f5f6f7] px-3 py-1.5 text-xs font-semibold text-[#3a6f77] transition-colors hover:border-[#3a6f77] hover:bg-[#3a6f77]/10'
                            >
                              <FaEdit className='text-[10px]' />
                              Edit
                            </Link>
                            <button
                              type='button'
                              onClick={() => handleDeleteProduct(item.id)}
                              className='inline-flex items-center gap-1 rounded-lg border border-[#2f2f33]/25 bg-[#f5f6f7] px-3 py-1.5 text-xs font-semibold text-[#2f2f33] transition-colors hover:border-[#2f2f33]/45 hover:bg-[#D4B483]/15'
                            >
                              <FaTrash className='text-[10px]' />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventoryshow
