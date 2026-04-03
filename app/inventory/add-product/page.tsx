"use client"

import Sidebar from '@/component/ui/Sidebar'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

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

const AddProductPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editProductId, setEditProductId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    sku: '',
    purchasePrice: '',
    quantity: '',
    category: '',
    sellingPrice: '',
    supplier: '',
  })

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId) return

    const parsedEditId = Number(editId)
    if (Number.isNaN(parsedEditId)) return

    const raw = localStorage.getItem('inventory_products')
    if (!raw) return

    try {
      const products = JSON.parse(raw) as Product[]
      const existingProduct = Array.isArray(products)
        ? products.find((item) => item.id === parsedEditId)
        : undefined

      if (!existingProduct) return

      setEditProductId(existingProduct.id)
      setForm({
        name: existingProduct.name,
        sku: existingProduct.sku,
        purchasePrice: String(existingProduct.purchasePrice),
        quantity: String(existingProduct.quantity),
        category: existingProduct.category,
        sellingPrice: String(existingProduct.sellingPrice),
        supplier: existingProduct.supplier,
      })
    } catch {
      setEditProductId(null)
    }
  }, [searchParams])

  const purchase = Number(form.purchasePrice || 0)
  const selling = Number(form.sellingPrice || 0)
  const quantity = Number(form.quantity || 0)
  const perUnitProfit = selling - purchase
  const totalEstimatedProfit = perUnitProfit * quantity

  const onFieldChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const raw = localStorage.getItem('inventory_products')
    const prevProducts: Product[] = raw ? JSON.parse(raw) : []
    const normalizedName = form.name.trim().toLowerCase()
    const hasDuplicateName = prevProducts.some(
      (product) => product.id !== editProductId && product.name.trim().toLowerCase() === normalizedName
    )

    if (hasDuplicateName) {
      setError('Same product name already exists. Please use a different name.')
      return
    }

    const nextProduct: Product = {
      id: editProductId ?? Date.now(),
      name: form.name.trim(),
      sku: form.sku.trim(),
      quantity: Number(form.quantity || 0),
      category: form.category,
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      supplier: form.supplier.trim(),
      createdAt: new Date().toLocaleString(),
    }

    const nextProducts = editProductId
      ? prevProducts.map((product) =>
          product.id === editProductId
            ? { ...nextProduct, createdAt: product.createdAt }
            : product
        )
      : [nextProduct, ...prevProducts]

    localStorage.setItem('inventory_products', JSON.stringify(nextProducts))
    sessionStorage.setItem('inventory_last_added_product', nextProduct.name)
    router.push('/inventory')
  }

  return (
    <div className='flex'>
      <Sidebar />
      <div className='w-full min-h-screen bg-[#f5f6f7] p-4 sm:p-6 md:p-8'>
        <div className='mx-auto max-w-4xl rounded-2xl border border-[#2f2f33]/10 bg-white p-4 sm:p-6'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-[#2f2f33]'>
              {editProductId ? 'Edit Product' : 'Add Product'}
            </h1>
            <button
              type='button'
              onClick={() => router.push('/inventory')}
              className='rounded-lg border border-[#2f2f33]/20 px-3 py-2 text-sm font-semibold text-[#2f2f33]'
            >
              Back
            </button>
          </div>

          <form onSubmit={handleAddProduct} className='space-y-4'>
            {error ? (
              <div className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                {error}
              </div>
            ) : null}

            <div>
              <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>Product Name</label>
              <input
                type='text'
                required
                value={form.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                placeholder='e.g. Industrial Grade Steel Pipe'
                className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>SKU Code</label>
                <input
                  type='text'
                  value={form.sku}
                  onChange={(e) => onFieldChange('sku', e.target.value)}
                  placeholder='e.g. SKU-1024'
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => onFieldChange('category', e.target.value)}
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
                >
                  <option value='' disabled>Select category</option>
                  <option>Electronics</option>
                  <option>Groceries</option>
                  <option>Clothing</option>
                  <option>Hardware</option>
                  <option>Stationery</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div>
                <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>Stock Quantity</label>
                <input
                  type='number'
                  min='0'
                  required
                  value={form.quantity}
                  onChange={(e) => onFieldChange('quantity', e.target.value)}
                  placeholder='0'
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>Purchase Price (₹)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.purchasePrice}
                  onChange={(e) => onFieldChange('purchasePrice', e.target.value)}
                  placeholder='0.00'
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>Selling Price (₹)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  required
                  value={form.sellingPrice}
                  onChange={(e) => onFieldChange('sellingPrice', e.target.value)}
                  placeholder='0.00'
                  className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
                />
              </div>
            </div>

            <div>
              <label className='mb-1 block text-sm font-semibold text-[#2f2f33]'>Supplier</label>
              <input
                type='text'
                value={form.supplier}
                onChange={(e) => onFieldChange('supplier', e.target.value)}
                placeholder='Enter supplier name (optional)'
                className='w-full rounded-lg border border-[#2f2f33]/10 bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none focus:border-[#3a6f77]'
              />
            </div>

            <div className='rounded-lg border border-[#D4B483]/40 bg-[#D4B483]/10 p-3'>
              <p className='text-xs font-semibold text-[#2f2f33]'>Profit Preview</p>
              <div className='mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2'>
                <p className='text-sm text-[#2f2f33]/80'>
                  Per Unit Profit:{' '}
                  <span className={`font-bold ${perUnitProfit >= 0 ? 'text-[#3a6f77]' : 'text-red-600'}`}>
                    ₹{perUnitProfit.toFixed(2)}
                  </span>
                </p>
                <p className='text-sm text-[#2f2f33]/80'>
                  Total Estimated Profit:{' '}
                  <span className={`font-bold ${totalEstimatedProfit >= 0 ? 'text-[#3a6f77]' : 'text-red-600'}`}>
                    ₹{totalEstimatedProfit.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <button
              type='submit'
              className='w-full rounded-lg bg-[#3a6f77] px-4 py-2.5 text-sm font-bold text-[#f5f6f7] transition-colors hover:bg-[#2f2f33]'
            >
              {editProductId ? 'Save Changes' : 'Add to Stock'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AddProductPageContent />
    </Suspense>
  )
}
