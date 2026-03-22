"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, FileText, Copy, FileOutput, AlertTriangle, FileIcon, Eye, Download, Calendar, Users, Receipt, Trash2 } from "lucide-react";

// ── Template Type ──
interface Template {
  id: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tags: string[];
  accentColor: string;
  preview: React.ReactNode;
}

// ── Report Type for Recent Reports ──
interface Report {
  id: number;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  period: string;
  generated: string;
  size: string;
  pages: string;
}

// ── ConfigurePanel Component ──
function ConfigurePanel({ selected, templates }: { selected: number | null; templates: Template[] }) {
  const t = templates.find((t: Template) => t.id === selected);
  const [dateFrom] = useState("01-01-2026");
  const [dateTo] = useState("20-02-2026");
  const [sections, setSections] = useState<Record<string, boolean>>({
    "Executive Summary": true,
    "Charts & Graphs": true,
    "Detailed Tables": true,
    "Customer Breakdown": false,
    "GST Summary": false,
  });

  const toggle = (key: string) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!t) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "#2f2f3340" }}>
        <FileIcon size={40} />
        <p className="text-sm font-medium">Select a template to configure</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#f5f6f760" }}>
        Configure
      </p>

      <div>
        <h2 className="text-xl font-bold" style={{ color: "#f5f6f7" }}>
          Generate{" "}
          <span style={{ color: t.accentColor, fontStyle: "italic" }}>{t.title}</span>
        </h2>
        <p className="text-xs mt-1" style={{ color: "#f5f6f780" }}>
          Customise the date range, format and sections below.
        </p>
      </div>

      {/* Report Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#f5f6f760" }}>Report Type</label>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#1e1e22", color: "#f5f6f7", border: "1px solid #f5f6f710" }}>
          <AlertTriangle size={14} color={t.accentColor} />
          {t.title}
          <span className="ml-auto" style={{ color: "#f5f6f740" }}>⌄</span>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#f5f6f760" }}>Date Range</label>
        <div className="flex gap-2">
          {[dateFrom, dateTo].map((d, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium flex-1" style={{ background: "#1e1e22", color: "#f5f6f7", border: "1px solid #f5f6f710" }}>
              {d}
              <Calendar size={12} color="#f5f6f740" className="ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#f5f6f760" }}>Format</label>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#1e1e22", color: "#f5f6f7", border: "1px solid #f5f6f710" }}>
          <FileIcon size={14} color="#f5f6f760" />
          PDF Document
          <span className="ml-auto" style={{ color: "#f5f6f740" }}>⌄</span>
        </div>
      </div>

      {/* Include Sections */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#f5f6f760" }}>Include Sections</label>
        {Object.entries(sections).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between py-1">
            <span className="text-sm" style={{ color: "#f5f6f7" }}>{key}</span>
            <div onClick={() => toggle(key)} className="relative cursor-pointer rounded-full transition-all duration-200" style={{ width: "40px", height: "22px", background: val ? t.accentColor : "#f5f6f720" }}>
              <div className="absolute top-0.5 rounded-full transition-all duration-200" style={{ width: "18px", height: "18px", background: "#f5f6f7", left: val ? "20px" : "2px" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-2">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-1 justify-center transition-all duration-200 hover:-translate-y-0.5" style={{ border: "1.5px solid #f5f6f730", color: "#f5f6f7", background: "transparent" }}>
          <Eye size={13} /> Preview
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-1 justify-center transition-all duration-200 hover:-translate-y-0.5" style={{ background: t.accentColor, color: "#2f2f33" }}>
          <Download size={13} /> Generate
        </button>
      </div>
    </div>
  );
}

// ── Recent Reports Component ──
function RecentReports() {
  const [list, setList] = useState<Report[]>([]);

  const clearAll = () => setList([]);

  return (
    <div className="w-full px-4 sm:px-6 py-6" style={{ background: "#f5f6f7" }}>
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold" style={{ color: "#2f2f33" }}>Recent Reports</h2>
          <p className="text-xs mt-0.5" style={{ color: "#2f2f3360" }}>
            Previously generated — click to preview or re-download
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/pdfreport/reports"
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{ border: "1.5px solid #3a6f77", color: "#3a6f77", background: "transparent" }}
          >
            View All
          </Link>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5 flex-shrink-0"
            style={{ border: "1.5px solid #2f2f3330", color: "#2f2f33", background: "transparent" }}
          >
            Clear History
          </button>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#2f2f33" }}>
        {/* ── Table Header — hidden on mobile ── */}
        <div
          className="hidden sm:grid px-4 py-3"
          style={{
            gridTemplateColumns: "2fr 1fr 2fr 0.7fr 0.7fr 32px",
            borderBottom: "1px solid #f5f6f710",
          }}
        >
          {["REPORT", "PERIOD", "GENERATED", "SIZE", "PAGES", ""].map((h, i) => (
            <span key={i} className="text-[10px] font-bold tracking-widest" style={{ color: "#f5f6f740" }}>
              {h}
            </span>
          ))}
        </div>

        {/* ── Rows ── */}
        {list.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm" style={{ color: "#f5f6f740" }}>No reports found.</p>
          </div>
        ) : (
          list.map((r, idx) => (
            <div
              key={r.id}
              className="flex flex-col sm:grid px-4 py-3 cursor-pointer transition-all duration-150 group"
              style={{
                gridTemplateColumns: "2fr 1fr 2fr 0.7fr 0.7fr 32px",
                borderBottom: idx < list.length - 1 ? "1px solid #f5f6f708" : "none",
              }}
            >
              {/* REPORT — icon + title + subtitle */}
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: "34px", height: "34px", background: r.iconBg }}
                >
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#f5f6f7" }}>{r.title}</p>
                  <p className="text-[11px]" style={{ color: "#f5f6f750" }}>{r.subtitle}</p>
                </div>
              </div>

              {/* Mobile: show all info inline */}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 sm:contents">
                {/* PERIOD */}
                <div className="flex sm:block items-center gap-1">
                  <span className="text-[10px] font-bold sm:hidden" style={{ color: "#f5f6f740" }}>Period: </span>
                  <p className="text-xs" style={{ color: "#f5f6f7" }}>{r.period}</p>
                </div>

                {/* GENERATED */}
                <div className="flex sm:block items-center gap-1">
                  <span className="text-[10px] font-bold sm:hidden" style={{ color: "#f5f6f740" }}>Generated: </span>
                  <p className="text-xs" style={{ color: "#f5f6f7" }}>{r.generated}</p>
                </div>

                {/* SIZE */}
                <div className="flex sm:block items-center gap-1">
                  <span className="text-[10px] font-bold sm:hidden" style={{ color: "#f5f6f740" }}>Size: </span>
                  <p className="text-xs" style={{ color: "#f5f6f7" }}>{r.size}</p>
                </div>

                {/* PAGES */}
                <div className="flex sm:block items-center gap-1">
                  <span className="text-[10px] font-bold sm:hidden" style={{ color: "#f5f6f740" }}>Pages: </span>
                  <p className="text-xs" style={{ color: "#f5f6f7" }}>{r.pages}</p>
                </div>

                {/* DELETE */}
                <div className="flex sm:flex items-center justify-end mt-1 sm:mt-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setList((prev) => prev.filter((x) => x.id !== r.id)); }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 p-1 rounded-lg"
                    style={{ color: "#f5f6f740" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Templates Data ──
const templates: Template[] = [
  {
    id: 1,
    icon: <DollarSign size={18} color="#D4B483" />,
    title: "Revenue Report",
    desc: "Monthly revenue breakdown, collection rates, and trend charts.",
    tags: ["FINANCE", "CHARTS"],
    accentColor: "#D4B483",
    preview: (
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-2 rounded-full" style={{ background: "#D4B483" }} />
        <div className="flex items-end gap-1" style={{ height: "44px" }}>
          {[60, 80, 50, 90, 70].map((h, i) => (
            <div key={i} className="w-2.5 rounded-sm" style={{ height: `${h}%`, background: "#D4B483", opacity: 0.5 + i * 0.1 }} />
          ))}
        </div>
        <div className="w-12 h-1 rounded-full" style={{ background: "#D4B48360" }} />
        <div className="w-10 h-1 rounded-full" style={{ background: "#D4B48340" }} />
      </div>
    ),
  },
  {
    id: 2,
    icon: <FileText size={18} color="#3a6f77" />,
    title: "Invoice Summary",
    desc: "Full list of all invoices with status, amounts, and due dates.",
    tags: ["INVOICES", "TABLE"],
    accentColor: "#3a6f77",
    preview: (
      <div className="flex flex-col gap-1.5" style={{ width: "68px" }}>
        <div className="h-2 rounded-full" style={{ background: "#3a6f77" }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-1">
            <div className="h-1.5 rounded-sm" style={{ width: "20px", background: "#3a6f7770" }} />
            <div className="h-1.5 rounded-sm" style={{ width: "26px", background: "#3a6f7750" }} />
            <div className="h-1.5 rounded-sm" style={{ width: "16px", background: "#3a6f7740" }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    icon: <Users size={18} color="#D4B483" />,
    title: "Customer Report",
    desc: "Customer activity, retention rates, and segment breakdown.",
    tags: ["CUSTOMERS", "ANALYTICS"],
    accentColor: "#D4B483",
    preview: (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 items-end" style={{ height: "44px" }}>
          {[3, 5, 4, 6, 5, 7].map((r, i) => (
            <div key={i} className="flex flex-col gap-0.5 items-center justify-end" style={{ height: "100%" }}>
              {Array.from({ length: r }).map((_, j) => (
                <div key={j} className="w-2 h-1.5 rounded-sm" style={{ background: "#D4B483", opacity: 0.4 + j * 0.1 }} />
              ))}
            </div>
          ))}
        </div>
        <div className="w-14 h-1 rounded-full" style={{ background: "#D4B48350" }} />
        <div className="w-10 h-1 rounded-full" style={{ background: "#D4B48330" }} />
      </div>
    ),
  },
  {
    id: 4,
    icon: <Receipt size={18} color="#3a6f77" />,
    title: "GST Tax Report",
    desc: "GST collected, paid, and net tax liability with filing summary.",
    tags: ["GST", "TAX"],
    accentColor: "#3a6f77",
    preview: (
      <div className="flex flex-col gap-1.5" style={{ width: "68px" }}>
        <div className="h-2 rounded-full" style={{ background: "#3a6f77" }} />
        <div className="flex gap-1 mt-1">
          <div className="h-5 rounded-sm flex-1" style={{ background: "#3a6f7760" }} />
          <div className="h-5 rounded-sm flex-1" style={{ background: "#3a6f7740" }} />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-1">
            <div className="h-1.5 rounded-sm" style={{ width: "22px", background: "#3a6f7760" }} />
            <div className="h-1.5 rounded-sm" style={{ width: "28px", background: "#3a6f7740" }} />
            <div className="h-1.5 rounded-sm" style={{ width: "14px", background: "#3a6f7730" }} />
          </div>
        ))}
      </div>
    ),
  },
];

// ── Main Component ──
export default function PDFreport() {
  const [selected, setSelected] = useState<number | null>(3);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "#f5f6f7" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #2f2f3318" }}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#2f2f33" }}>PDF Reports</h1>
          <p suppressHydrationWarning className="text-xs mt-0.5" style={{ color: "#2f2f3360" }}>{`Today ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5" style={{ background: "#D4B483", color: "#2f2f33" }}>
            <Copy size={13} />
            <span className="hidden sm:inline">Copy All Links</span>
            <span className="sm:hidden">Copy</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5" style={{ border: "1.5px solid #3a6f77", color: "#3a6f77", background: "transparent" }}>
            <FileOutput size={13} />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* ── Left: Templates ── */}
        <div className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto" style={{ borderRight: "1px solid #2f2f3312" }}>
          <div className="mb-5">
            <h2 className="text-sm font-bold" style={{ color: "#2f2f33" }}>Report Templates</h2>
            <p className="text-xs mt-0.5" style={{ color: "#2f2f3350" }}>Choose a template and configure options on the right</p>
          </div>

          {/* 4 Cards in 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => {
              const isSelected = selected === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(isSelected ? null : t.id)}
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
                  style={{
                    background: "#2f2f33",
                    border: isSelected ? `2px solid ${t.accentColor}` : "2px solid transparent",
                    boxShadow: isSelected ? `0 0 20px ${t.accentColor}25` : "none",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div className="rounded-xl flex items-center justify-center mb-4" style={{ background: "#1e1e22", height: "110px" }}>
                    {t.preview}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {t.icon}
                    <span className="font-bold text-sm" style={{ color: "#f5f6f7" }}>{t.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#f5f6f770" }}>{t.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {t.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide" style={{ background: `${t.accentColor}18`, color: t.accentColor, border: `1px solid ${t.accentColor}50` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Configure Panel ── */}
        <div className="w-full lg:w-80 xl:w-96 px-4 sm:px-6 py-6 flex-shrink-0" style={{ background: "#2f2f33" }}>
          <ConfigurePanel selected={selected} templates={templates} />
        </div>
      </div>

      {/* ── Recent Reports Section ── */}
      {/* Recent reports moved to separate page at /pdfreport/reports */}
    </div>
  );
}
