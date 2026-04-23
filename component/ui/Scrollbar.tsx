"use client";

import React from 'react'

const items = [
  "Smart Invoicing",
  "Auto Reminders",
  "WhatsApp ",
  "Live Dashboard",
  "PDF Reports",
  "Secure & Private",
]

const colors = ["#D4B483", "#3a6f77", "#f5f6f7", "#2f2f33"]

const Scrollbar = () => {
  const repeated = [...items, ...items, ...items]

  return (
    <div
      className="w-full overflow-hidden bg-[#1a1a1e] py-4"
      onMouseEnter={e => {
        const el = e.currentTarget.querySelector('[data-scroll]') as HTMLElement | null
        if (el) el.style.animationPlayState = 'paused'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget.querySelector('[data-scroll]') as HTMLElement | null
        if (el) el.style.animationPlayState = 'running'
      }}
    >
      <div
        data-scroll
        className="flex gap-3 w-max"
        style={{ animation: "scroll 20s linear infinite", animationPlayState: "running" }}
      >
        {repeated.map((label, i) => {
          const colorIndex = i % 4
          const bg = colors[colorIndex]
          const isDark = bg === "#2f2f33" || bg === "#3a6f77"
          const textColor = isDark ? "#f5f6f7" : "#2f2f33"
          const dotColor = isDark ? "#D4B483" : "#3a6f77"

          return (
            <span
              key={i}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={{ backgroundColor: bg, color: textColor }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              {label}
            </span>
          )
        })}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}

export default Scrollbar