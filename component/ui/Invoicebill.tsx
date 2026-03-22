"use client";

import React, { useEffect, useState } from "react";
import { FaFilePdf, FaEdit, FaArrowLeft, FaPaperPlane, FaTrashAlt } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import jsPDF from "jspdf";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  panNumber: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  defaultCurrency: string;
}

const InvoiceSchema = Yup.object().shape({
  clientName: Yup.string().required("Client name is required"),
  clientEmail: Yup.string().email("Invalid email"),
  clientPhone: Yup.string().required("Phone number is required"),
  countryCode: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  zipCode: Yup.string(),
  invoiceNumber: Yup.string().required("Invoice number is required"),
  issueDate: Yup.date().required("Invoice date is required"),
  dueDate: Yup.date(),
  notes: Yup.string(),
  discount: Yup.number().min(0, "Cannot be negative").default(0),
  taxRate: Yup.number().min(0, "Cannot be negative").default(0),
  items: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required("Item description required"),
      quantity: Yup.number().positive().integer().required("Quantity required"),
      price: Yup.number().positive().required("Price required"),
    }),
  ),
});

const InvoiceForm = () => {
  const [business, setBusiness] = useState<any>(null);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

  // Limits logic
  const [planName, setPlanName] = useState<string>("Starter");
  const [invoiceLimit, setInvoiceLimit] = useState<number | null>(10);
  const [monthUsage, setMonthUsage] = useState<number>(0);
  const [submitAction, setSubmitAction] = useState<'save' | 'send'>('save');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("INV-0001");

  useEffect(() => {
    const loadBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (biz) {
        setBusiness(biz);

        // Resolve Subscription limits
        const { data: sub } = await supabase
          .from('subscriptions')
          .select(`plan_id, status, plans(name, invoice_limit)`)
          .eq('business_id', biz.id)
          .eq('status', 'active')
          .maybeSingle();

        let pLimit: number | null = 10;
        let pName = "Starter";

        if (sub && sub.plans) {
          const pInfo: any = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
          pLimit = pInfo.invoice_limit;
          pName = pInfo.name;
        } else {
          const { data: freeP } = await supabase.from('plans').select('invoice_limit, name').eq('id', 'free').maybeSingle();
          if (freeP) {
            pLimit = freeP.invoice_limit;
            pName = freeP.name;
          }
        }

        setInvoiceLimit(pLimit);
        setPlanName(pName);

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', biz.id)
          .gte('created_at', startOfMonth);

        setMonthUsage(count || 0);

        // Fetch the latest invoice to auto-sequence
        const { data: lastInvoice } = await supabase
          .from('invoices')
          .select('invoice_number')
          .eq('business_id', biz.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastInvoice && lastInvoice.invoice_number) {
          const match = lastInvoice.invoice_number.match(/INV-(\d+)/);
          if (match && match[1]) {
            const nextNum = parseInt(match[1], 10) + 1;
            setNextInvoiceNumber(`INV-${nextNum.toString().padStart(4, '0')}`);
          } else {
            setNextInvoiceNumber(`INV-${Date.now().toString().slice(-4)}`);
          }
        }
      }

      const storedLogo = localStorage.getItem("businessLogo");
      if (storedLogo) setBusinessLogo(storedLogo);
    };

    loadBusiness();
  }, []);

  const generatePDF = async (values: any, subtotal: number, tax: number, total: number, discountAmount: number = 0) => {
    const doc = new jsPDF();

    // Helper function to crop logo to circle
    const getCircularLogo = (url: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(url);

          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          const dx = (img.width - size) / 2;
          const dy = (img.height - size) / 2;
          ctx.drawImage(img, dx, dy, size, size, 0, 0, size, size);

          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(url);
        img.src = url;
      });
    };

    let finalLogo = businessLogo;
    if (businessLogo) {
      finalLogo = await getCircularLogo(businessLogo);
    }

    doc.setFont("helvetica");

    // TOP HEADER
    if (finalLogo) {
      try { doc.addImage(finalLogo, 'PNG', 15, 15, 20, 20); } catch (e) { }
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (business?.business_name) {
      doc.text(business.business_name, finalLogo ? 40 : 15, 27);
    }

    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 195, 29, { align: "right" });

    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    // INVOICE DETAILS
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(`Invoice No : ${values.invoiceNumber}`, 15, 50);
    doc.text(`Date : ${values.issueDate}`, 15, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(values.status === 'paid' ? "Amount Due" : "Total Due", 15, 75);
    doc.setFontSize(16);

    const amountDue = values.status === 'paid' ? 0 : total;
    doc.text(`Rs. ${amountDue.toFixed(2)}`, 15, 83);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice to :", 195, 50, { align: "right" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text((values.clientName || '').toUpperCase(), 195, 57, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    let cY = 62;
    if (values.clientEmail) { doc.text(values.clientEmail, 195, cY, { align: "right" }); cY += 4; }
    if (values.address) { doc.text(values.address, 195, cY, { align: "right" }); cY += 4; }
    if (values.city || values.zipCode) { doc.text(`${values.city || ''} ${values.zipCode || ''}`.trim(), 195, cY, { align: "right" }); cY += 4; }
    if (values.clientPhone) { doc.text(values.clientPhone, 195, cY, { align: "right" }); cY += 4; }

    // TABLE
    const tableStartY = 100;

    doc.setLineWidth(0.5);
    doc.line(15, tableStartY, 195, tableStartY); // Top border

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("ITEM", 15, tableStartY + 6);
    doc.text("PRICE", 100, tableStartY + 6, { align: "center" });
    doc.text("QTY", 140, tableStartY + 6, { align: "center" });
    doc.text("TOTAL", 195, tableStartY + 6, { align: "right" });

    doc.setLineWidth(0.2);
    doc.line(15, tableStartY + 9, 195, tableStartY + 9); // Bottom header

    doc.setFont("helvetica", "normal");
    let y = tableStartY + 16;

    values.items.forEach((item: any) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const amount = qty * price;

      const splitDesc = doc.splitTextToSize(item.description || '', 75);
      doc.text(splitDesc, 15, y);

      doc.text(`Rs. ${price.toFixed(2)}`, 100, y, { align: "center" });
      doc.text(`${qty}`, 140, y, { align: "center" });
      doc.text(`Rs. ${amount.toFixed(2)}`, 195, y, { align: "right" });

      y += splitDesc.length * 5 + 3;
    });

    // TABLE END LINE
    doc.setLineWidth(0.2);
    doc.line(15, y, 195, y);
    y += 10;

    // TOTALS SECTION
    // Left side: Payment Method (Notes wrapper)
    if (values.notes) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method :", 15, y);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(values.notes, 80);
      doc.text(splitNotes, 15, y + 5);
    }

    // Right side: Subtotal & Tax
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Sub-total :", 150, y, { align: "right" });
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 195, y, { align: "right" });
    y += 6;

    if (values.discount > 0) {
      doc.text(`Discount (${values.discount}%) :`, 150, y, { align: "right" });
      doc.text(`-Rs. ${discountAmount.toFixed(2)}`, 195, y, { align: "right" });
      y += 6;
    }

    if (values.taxRate > 0) {
      doc.text(`Tax (${values.taxRate}%) :`, 150, y, { align: "right" });
      doc.text(`Rs. ${tax.toFixed(2)}`, 195, y, { align: "right" });
      y += 6;
    }

    // Total line
    doc.setLineWidth(0.5);
    doc.line(130, y + 2, 195, y + 2);
    y += 9;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total :", 150, y, { align: "right" });
    doc.text(`Rs. ${total.toFixed(2)}`, 195, y, { align: "right" });

    // FOOTER (Thank you & Contact)
    y = 250;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Thank you for purchase!", 15, 235);

    doc.setFontSize(9);
    doc.text("Contact Us", 15, 250);
    doc.setFont("helvetica", "normal");
    if (business?.business_phone) doc.text(business.business_phone, 15, 255);
    if (business?.business_email) doc.text(business.business_email, 15, 260);
    if (business?.business_address) {
      const splitBizAddr = doc.splitTextToSize(business.business_address, 80);
      doc.text(splitBizAddr, 15, 265);
    }

    // Signature bounds
    if (business?.signature_url) {
      try {
        let sigFormat = 'PNG';
        if (business.signature_url.includes('image/jpeg') || business.signature_url.includes('image/jpg')) sigFormat = 'JPEG';
        else if (business.signature_url.includes('image/webp')) sigFormat = 'WEBP';
        doc.addImage(business.signature_url, sigFormat, 150, 240, 40, 15);
      } catch (e) { }
    }
    doc.setFontSize(8);
    doc.text("Authorized Signatory", 170, 260, { align: "center" });

    if (planName === "Starter" || planName === "Free") {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Generated by Smart Bill - Upgrade to remove watermark", 105, 290, { align: "center" });
    }

    return doc;
  };

  const sendInvoice = async (values: any, subtotal: number, tax: number, total: number) => {
    if (invoiceLimit !== null && monthUsage >= invoiceLimit) {
      alert(`Error: You have reached the ${invoiceLimit} invoice limit for your ${planName} Plan this month. Please go to Pricing to upgrade your account and unlock more limits!`);
      return;
    }

    if (!business) return alert("Business profile not found");
    const doc = await generatePDF(values, subtotal, tax, total, values.discountAmount);

    const fileName = `${values.invoiceNumber}.pdf`;

    const pdfBlob = doc.output('blob');
    const filePath = `${business.id}/${fileName}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('invoices')
      .upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: true });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      alert("Note: Failed to upload PDF to cloud storage, but database record will still be created.");
    }
    const pdfPath = uploadData?.path || null;

    let publicUrl = "";
    if (pdfPath) {
      const { data: publicUrlData } = supabase.storage.from('invoices').getPublicUrl(pdfPath);
      publicUrl = publicUrlData.publicUrl;
    }

    let customerId = null;
    if (values.clientEmail) {
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .upsert({
          business_id: business.id,
          name: values.clientName,
          email: values.clientEmail,
          city: values.city,
          phone: values.clientPhone,
        }, { onConflict: 'business_id, email' })
        .select()
        .single();
      if (custErr) console.error(custErr);
      customerId = custData?.id;
    } else {
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .insert({
          business_id: business.id,
          name: values.clientName,
          city: values.city,
          phone: values.clientPhone,
        })
        .select()
        .single();
      if (custErr) console.error(custErr);
      customerId = custData?.id;
    }

    const { data: invData, error: invErr } = await supabase
      .from('invoices')
      .insert({
        business_id: business.id,
        customer_id: customerId,
        invoice_number: values.invoiceNumber,
        issue_date: values.issueDate,
        due_date: values.dueDate,
        status: values.status || "unpaid",
        currency: "INR",
        subtotal: subtotal,
        discount_amount: values.discountAmount || 0,
        gst_rate: values.taxRate,
        gst_amount: tax,
        total_amount: total,
        client_name_snapshot: values.clientName,
        client_email_snapshot: values.clientEmail,
        client_address_snapshot: values.address,
        client_city_snapshot: values.city,
        client_zip_snapshot: values.zipCode,
        client_phone_snapshot: values.clientPhone,
        notes: values.notes,
        pdf_path: pdfPath
      })
      .select()
      .single();

    if (invErr || !invData) {
      return alert("Error saving invoice: " + (invErr?.message || "unknown"));
    }

    const itemsToInsert = values.items.map((i: any, index: number) => ({
      invoice_id: invData.id,
      line_no: index + 1,
      description: i.description,
      quantity: Number(i.quantity),
      unit_price: Number(i.price),
      line_amount: Number(i.quantity) * Number(i.price)
    }));
    await supabase.from('invoice_items').insert(itemsToInsert);

    setMonthUsage((prev) => prev + 1);

    if (submitAction === 'send' && publicUrl) {
      const bizName = business?.business_name || 'us';

      alert("Sending now... Please wait.");
      try {
        let waSuccess = false;
        let waErrorMsg = "";

        if (values.clientPhone) {
          try {
            const waRes = await fetch('/api/send-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clientPhone: values.clientPhone,
                clientName: values.clientName,
                businessName: bizName,
                currency: "INR",
                total: total.toFixed(2),
                publicUrl: publicUrl
              })
            });
            if (waRes.ok) waSuccess = true;
            else {
              const waData = await waRes.json();
              waErrorMsg = waData.error || 'Unknown WhatsApp Error';
            }
          } catch (e: any) { waErrorMsg = e.message; }
        }

        let emailSuccess = false;
        let emailErrorMsg = "";

        if (values.clientEmail) {
          const res = await fetch('/api/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientEmail: values.clientEmail,
              clientName: values.clientName,
              businessName: bizName,
              currency: "INR",
              total: total.toFixed(2),
              publicUrl: publicUrl
            })
          });

          if (res.ok) {
            emailSuccess = true;
          } else {
            const resData = await res.json();
            emailErrorMsg = resData.error || 'Failed to send email';
          }
        }

        let msg = "Success! Invoice saved & securely dispatched";
        if (emailSuccess && waSuccess) msg += " via Email and WhatsApp.";
        else if (emailSuccess) msg += " via Email.";
        else if (waSuccess) msg += " via WhatsApp.";
        else msg = "Invoice saved successfully, but no reliable dispatch method triggered.";

        if (emailErrorMsg) msg += `\n\n⚠️ Email Failed: ${emailErrorMsg}`;
        if (waErrorMsg) msg += `\n⚠️ WhatsApp Failed: ${waErrorMsg}\n(Twilio Sandbox requires recipients to message 'join <word>' first, or verify the Sender number!)`;

        alert(msg);
      } catch (err: any) {
        alert(`Invoice saved locally, but sending failed: ${err.message}`);
      }
    } else {
      alert("Invoice saved to database!");
    }
  };

  const getToday = () => new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white rounded-lg shadow-sm border border-gray-100">
      <Formik
        enableReinitialize
        initialValues={{
          clientName: "",
          clientEmail: "",
          countryCode: "+91",
          clientPhone: "",
          address: "",
          city: "",
          zipCode: "",
          invoiceNumber: nextInvoiceNumber,
          issueDate: getToday(),
          dueDate: "",
          status: "unpaid",
          discount: 0,
          taxRate: 0,
          notes: "",
          items: [{ description: "", quantity: 1, price: 0 }],
        }}
        validationSchema={InvoiceSchema}
        onSubmit={(values) => {
          const code = values.countryCode || "+91";
          const finalPhone = values.clientPhone
            ? (values.clientPhone.startsWith('+') ? values.clientPhone : `${code}${values.clientPhone.replace(/^\s+/, '')}`)
            : "";

          const subtotal = values.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
          const discountPercent = Number(values.discount) || 0;
          const discountAmount = subtotal * (discountPercent / 100);
          const discountedSubtotal = Math.max(0, subtotal - discountAmount);
          const tax = discountedSubtotal * ((Number(values.taxRate) || 0) / 100);
          const total = discountedSubtotal + tax;

          sendInvoice({ ...values, clientPhone: finalPhone, discountAmount }, subtotal, tax, total);
        }}
      >
        {({ values, setFieldValue }) => {
          const subtotal = values.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
          const discountPercent = Number(values.discount) || 0;
          const discountAmount = subtotal * (discountPercent / 100);
          const discountedSubtotal = Math.max(0, subtotal - discountAmount);
          const tax = discountedSubtotal * ((Number(values.taxRate) || 0) / 100);
          const total = discountedSubtotal + tax;

          return (
            <Form className="space-y-10">

              {/* Company details */}
              <div>
                <h3 className="text-sm font-semibold text-[#2f2f33] mb-4 border-b border-gray-100 pb-2 tracking-wide uppercase">Company details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Company Name</label>
                    <input type="text" disabled value={business?.business_name || "Configure in Settings"} className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input type="text" disabled value={business?.business_email || "Configure in Settings"} className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                    <input type="text" disabled value={business?.business_address || "Configure in Settings"} className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input type="text" disabled value={business?.business_phone || "Configure in Settings"} className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-700 outline-none" />
                  </div>
                </div>
              </div>

              {/* Client details */}
              <div>
                <h3 className="text-sm font-semibold text-[#2f2f33] mb-4 border-b border-gray-100 pb-2 tracking-wide uppercase">Client details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Client Name</label>
                    <Field name="clientName" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                    <ErrorMessage name="clientName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <Field name="clientEmail" type="email" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                    <ErrorMessage name="clientEmail" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                    <Field name="address" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                    <ErrorMessage name="address" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <div className="flex border border-gray-200 focus-within:border-[#3a6f77] focus-within:ring-1 focus-within:ring-[#3a6f77] rounded transition-all">
                      <Field as="select" name="countryCode" className="bg-gray-50 text-gray-700 p-2 border-r border-gray-200 outline-none cursor-pointer text-sm font-medium">
                        <option value="+91">IN (+91)</option>
                        <option value="+1">US (+1)</option>
                        <option value="+44">UK (+44)</option>
                        <option value="+971">UAE (+971)</option>
                        <option value="+61">AU (+61)</option>
                        <option value="+65">SG (+65)</option>
                        <option value="+49">DE (+49)</option>
                      </Field>
                      <Field name="clientPhone" type="tel" className="flex-1 px-3 py-2 outline-none bg-transparent text-sm text-gray-800" />
                    </div>
                    <ErrorMessage name="clientPhone" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <Field name="city" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ZIP Code</label>
                    <Field name="zipCode" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Invoice information */}
              <div>
                <h3 className="text-sm font-semibold text-[#2f2f33] mb-4 border-b border-gray-100 pb-2 tracking-wide uppercase">Invoice information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Number</label>
                    <Field name="invoiceNumber" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all font-semibold bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <Field as="select" name="status" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all cursor-pointer">
                      <option value="draft">Draft</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </Field>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Date</label>
                    <Field name="issueDate" type="date" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                    <Field name="dueDate" type="date" className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all" />
                    <ErrorMessage name="dueDate" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-[#2f2f33] mb-4 border-b border-gray-100 pb-2 tracking-wide uppercase">Items</h3>

                {/* Header row for desktop */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 px-2 border-b border-gray-100 pb-2">
                  <div className="col-span-6 text-xs text-gray-500 font-semibold tracking-wide">Description</div>
                  <div className="col-span-2 text-xs text-gray-500 font-semibold tracking-wide">Quantity</div>
                  <div className="col-span-2 text-xs text-gray-500 font-semibold tracking-wide">Price</div>
                  <div className="col-span-2 text-xs text-gray-500 font-semibold tracking-wide text-right">Total</div>
                </div>

                <FieldArray name="items">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.items.map((item, index) => {
                        const itemTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                        return (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center group bg-white border border-gray-200 md:border-transparent md:border-b-gray-100 hover:border-gray-200 p-4 md:p-2 rounded-lg transition-all shadow-sm md:shadow-none">
                            <div className="md:col-span-6">
                              <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                              <Field name={`items[${index}].description`} className="w-full bg-gray-50 md:bg-transparent border border-gray-200 md:border-transparent hover:border-gray-300 focus:border-[#3a6f77] focus:bg-white rounded px-3 py-2 md:px-2 md:py-1.5 text-sm text-gray-800 outline-none transition-all" placeholder="Item description" />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-3 md:block">
                              <div className="md:hidden">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Qty</label>
                                <Field type="number" name={`items[${index}].quantity`} className="w-full bg-gray-50 border border-gray-200 focus:border-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none" />
                              </div>
                              <div className="hidden md:block">
                                <Field type="number" name={`items[${index}].quantity`} className="w-full md:bg-transparent border border-transparent hover:border-gray-300 focus:border-[#3a6f77] focus:bg-white rounded px-2 py-1.5 text-sm text-gray-800 outline-none transition-all" />
                              </div>

                              <div className="md:hidden">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Price</label>
                                <Field type="number" name={`items[${index}].price`} className="w-full bg-gray-50 border border-gray-200 focus:border-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none" />
                              </div>
                            </div>
                            <div className="hidden md:block md:col-span-2">
                              <Field type="number" name={`items[${index}].price`} className="w-full md:bg-transparent border border-transparent hover:border-gray-300 focus:border-[#3a6f77] focus:bg-white rounded px-2 py-1.5 text-sm text-gray-800 outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2 flex justify-between md:justify-end items-center px-2 pt-2 md:pt-0 mt-2 md:mt-0 border-t md:border-t-0 border-gray-100">
                              <span className="md:hidden text-xs font-semibold text-gray-500">Item Total:</span>
                              <span className="font-semibold text-sm text-gray-800">₹{itemTotal.toFixed(2)}</span>
                              {values.items.length > 1 && (
                                <button type="button" onClick={() => remove(index)} className="ml-4 text-red-300 hover:text-red-500 transition-colors bg-red-50 p-2 rounded-full md:bg-transparent md:p-0">
                                  <FaTrashAlt />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button type="button" onClick={() => push({ description: "", quantity: 1, price: 0 })} className="text-[#3a6f77] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#f6f9fa] border border-dashed border-[#3a6f77] w-full py-3 rounded-lg mt-4 transition-colors">
                        + Add Item
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Totals & Notes */}
              <div className="flex flex-col lg:flex-row justify-between gap-12 pt-8 border-t border-gray-100">
                {/* Notes */}
                <div className="flex-1 lg:order-1 order-2">
                  <h3 className="text-sm font-semibold text-[#2f2f33] mb-3">Additional details</h3>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Notes</label>
                  <Field as="textarea" rows={5} name="notes" placeholder="Additional notes or payment terms..." className="w-full border border-gray-200 focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] rounded-lg px-4 py-3 text-sm text-gray-800 outline-none resize-none transition-all shadow-sm" />
                </div>

                {/* Totals Box */}
                <div className="w-full lg:w-96 lg:order-2 order-1 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Discount (%)</label>
                      <Field type="number" name="discount" className="w-full border border-gray-300 focus:border-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tax Rate (%)</label>
                      <Field type="number" name="taxRate" className="w-full border border-gray-300 focus:border-[#3a6f77] rounded px-3 py-2 text-sm text-gray-800 outline-none shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Discount ({discountPercent}%)</span>
                        <span className="font-semibold text-red-500">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span className="font-medium">Tax ({values.taxRate || 0}%)</span>
                      <span className="font-semibold text-gray-800">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-4 border-t border-gray-100 justify-end">
                <button type="submit" onClick={() => setSubmitAction('save')} className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">
                  Save Invoice (No Send)
                </button>
                <button type="submit" onClick={() => setSubmitAction('send')} className="bg-[#3a6f77] text-white px-8 py-3 rounded-lg hover:bg-[#2c5359] transition flex items-center justify-center gap-2 text-sm font-bold shadow-md hover:shadow-lg">
                  <FaPaperPlane className="mr-1" /> Save & Send
                </button>
              </div>

            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

const Invoicebill = () => {
  return (
    <div className="h-[100vh] w-full flex flex-col overflow-hidden bg-gray-50">
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-5 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/invoice" className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <FaArrowLeft className="text-gray-500 group-hover:text-[#2f2f33] text-xl transition-colors" />
          </Link>
          <div>
            <h1 className="text-2xl text-[#2f2f33] font-bold tracking-tight">Create Invoice</h1>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-2 sm:px-8 py-8">
        <InvoiceForm />
      </div>
    </div>
  );
};

export default Invoicebill;
