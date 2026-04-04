"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  FileText,
  Trash2,
  ArrowLeft,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

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

type StoredReport = Omit<Report, "icon"> & {
  iconKey?: "DollarSign" | "FileText";
};

const iconFor = (iconKey?: StoredReport["iconKey"]) => {
  if (iconKey === "FileText") {
    return <FileText size={16} color="#3a6f77" />;
  }

  return <DollarSign size={16} color="#D4B483" />;
};

export default function RecentReportsPage() {
  const [list, setList] = useState<Report[]>([
    {
      id: 1,
      icon: <DollarSign size={16} color="#D4B483" />,
      iconBg: "#D4B48320",
      title: "Revenue Report",
      subtitle: "Revenue",
      period: "Jan – Feb 2026",
      generated: "20 Feb 2026, 10:42 AM",
      size: "1.2 MB",
      pages: "3 pg",
    },
    {
      id: 2,
      icon: <FileText size={16} color="#3a6f77" />,
      iconBg: "#3a6f7720",
      title: "Invoice Summary",
      subtitle: "Invoice",
      period: "Feb 2026",
      generated: "15 Feb 2026, 3:10 PM",
      size: "0.8 MB",
      pages: "2 pg",
    },
    {
      id: 3,
      icon: <DollarSign size={16} color="#3a6f77" />,
      iconBg: "#3a6f7720",
      title: "GST Report Q4",
      subtitle: "Tax",
      period: "Oct – Dec 2025",
      generated: "01 Jan 2026, 9:00 AM",
      size: "1.5 MB",
      pages: "5 pg",
    },
    {
      id: 4,
      icon: <DollarSign size={16} color="#D4B483" />,
      iconBg: "#D4B48320",
      title: "Aging Report",
      subtitle: "Aging",
      period: "Feb 2026",
      generated: "10 Feb 2026, 11:00 AM",
      size: "0.6 MB",
      pages: "2 pg",
    },
    {
      id: 5,
      icon: <DollarSign size={16} color="#D4B483" />,
      iconBg: "#D4B48320",
      title: "Customer Report",
      subtitle: "Customer",
      period: "2025 Annual",
      generated: "05 Jan 2026, 2:30 PM",
      size: "2.1 MB",
      pages: "7 pg",
    },
    {
      id: 6,
      icon: <FileText size={16} color="#3a6f77" />,
      iconBg: "#3a6f7720",
      title: "Monthly Sales",
      subtitle: "Sales",
      period: "Jan 2026",
      generated: "01 Feb 2026, 10:00 AM",
      size: "0.9 MB",
      pages: "4 pg",
    },
    {
      id: 7,
      icon: <DollarSign size={16} color="#D4B483" />,
      iconBg: "#D4B48320",
      title: "Expense Report",
      subtitle: "Expense",
      period: "Q4 2025",
      generated: "15 Jan 2026, 4:30 PM",
      size: "1.1 MB",
      pages: "6 pg",
    },
    {
      id: 8,
      icon: <FileText size={16} color="#3a6f77" />,
      iconBg: "#3a6f7720",
      title: "Profit & Loss",
      subtitle: "Finance",
      period: "2025 Annual",
      generated: "20 Jan 2026, 9:15 AM",
      size: "2.5 MB",
      pages: "12 pg",
    },
  ]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const savedReports = window.localStorage.getItem("billingkitaab:recentReports");

    if (!savedReports) {
      return;
    }

    try {
      const parsedReports = JSON.parse(savedReports) as StoredReport[];
      if (!Array.isArray(parsedReports) || parsedReports.length === 0) {
        return;
      }

      setList((current) => {
        const generated = parsedReports.map((report) => ({
          ...report,
          icon: iconFor(report.iconKey),
        }));

        const dedupedCurrent = current.filter(
          (report) => !generated.some((item) => item.title === report.title && item.generated === report.generated)
        );

        return [...generated, ...dedupedCurrent];
      });
    } catch {
      window.localStorage.removeItem("billingkitaab:recentReports");
    }
  }, []);

  const clearAll = () => {
    window.localStorage.removeItem("billingkitaab:recentReports");
    setList([]);
  };

  const openPreview = (report: Report) => {
    setSelectedReport(report);
  };

  const downloadReport = (report: Report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text(report.title, 14, 18);

    doc.setFontSize(11);
    doc.text(`Type: ${report.subtitle}`, 14, 32);
    doc.text(`Period: ${report.period}`, 14, 40);
    doc.text(`Generated: ${report.generated}`, 14, 48);
    doc.text(`Size: ${report.size}`, 14, 56);
    doc.text(`Pages: ${report.pages}`, 14, 64);

    doc.setFontSize(12);
    doc.text("Report Summary", 14, 80);
    doc.setFontSize(10);
    doc.text(
      `${report.title} is an invoice-focused report generated from your BillingKitaab dashboard.`,
      14,
      90,
      { maxWidth: pageWidth - 28 }
    );

    doc.save(`${report.title.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "#f5f6f7" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid #2f2f3318" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/pdfreport"
            className="flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-200"
            style={{ width: "36px", height: "36px" }}
          >
            <ArrowLeft
              size={20}
              color="#2f2f33"
              className="cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          </Link>
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "#2f2f33" }}
            >
              All Reports
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#2f2f3360" }}>
              View all your generated reports
            </p>
          </div>
        </div>
        <button
          onClick={clearAll}
          className="px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
          style={{
            border: "1.5px solid #2f2f3330",
            color: "#2f2f33",
            background: "transparent",
          }}
        >
          Clear All
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#2f2f33" }}
        >
          {/* ── Table Header — hidden on mobile ── */}
          <div
            className="hidden sm:grid px-4 py-3"
            style={{
              gridTemplateColumns: "2fr 1fr 2fr 0.7fr 0.7fr 80px",
              borderBottom: "1px solid #f5f6f710",
            }}
          >
            {["REPORT", "PERIOD", "GENERATED", "SIZE", "PAGES", "ACTIONS"].map(
              (h, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold tracking-widest"
                  style={{ color: "#f5f6f740" }}
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {/* ── Rows ── */}
          {list.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FileText
                  size={48}
                  color="#f5f6f720"
                  className="mx-auto mb-3"
                />
                <p className="text-sm" style={{ color: "#f5f6f740" }}>
                  No reports found.
                </p>
              </div>
            </div>
          ) : (
            list.map((r, idx) => (
              <div
                key={r.id}
                className="flex flex-col sm:grid px-4 py-3 transition-all duration-150 group"
                style={{
                  gridTemplateColumns: "2fr 1fr 2fr 0.7fr 0.7fr 80px",
                  borderBottom:
                    idx < list.length - 1 ? "1px solid #f5f6f708" : "none",
                }}
              >
                {/* REPORT — icon + title + subtitle */}
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div
                    className="flex items-center justify-center rounded-lg shrink-0"
                    style={{
                      width: "34px",
                      height: "34px",
                      background: r.iconBg,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#f5f6f7" }}
                    >
                      {r.title}
                    </p>
                    <p className="text-[11px]" style={{ color: "#f5f6f750" }}>
                      {r.subtitle}
                    </p>
                  </div>
                </div>

                {/* Mobile: show all info inline */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 sm:contents">
                  {/* PERIOD */}
                  <div className="flex sm:block items-center gap-1">
                    <span
                      className="text-[10px] font-bold sm:hidden"
                      style={{ color: "#f5f6f740" }}
                    >
                      Period:{" "}
                    </span>
                    <p className="text-xs" style={{ color: "#f5f6f7" }}>
                      {r.period}
                    </p>
                  </div>

                  {/* GENERATED */}
                  <div className="flex sm:block items-center gap-1">
                    <span
                      className="text-[10px] font-bold sm:hidden"
                      style={{ color: "#f5f6f740" }}
                    >
                      Generated:{" "}
                    </span>
                    <p className="text-xs" style={{ color: "#f5f6f7" }}>
                      {r.generated}
                    </p>
                  </div>

                  {/* SIZE */}
                  <div className="flex sm:block items-center gap-1">
                    <span
                      className="text-[10px] font-bold sm:hidden"
                      style={{ color: "#f5f6f740" }}
                    >
                      Size:{" "}
                    </span>
                    <p className="text-xs" style={{ color: "#f5f6f7" }}>
                      {r.size}
                    </p>
                  </div>

                  {/* PAGES */}
                  <div className="flex sm:block items-center gap-1">
                    <span
                      className="text-[10px] font-bold sm:hidden"
                      style={{ color: "#f5f6f740" }}
                    >
                      Pages:{" "}
                    </span>
                    <p className="text-xs" style={{ color: "#f5f6f7" }}>
                      {r.pages}
                    </p>
                  </div>

                  {/* ACTIONS - Desktop */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => openPreview(r)}
                      className="p-1.5 rounded-lg transition-all duration-150 hover:bg-white/10"
                      title="Preview"
                    >
                      <Eye size={14} color="#f5f6f7" />
                    </button>
                    <button
                      onClick={() => downloadReport(r)}
                      className="p-1.5 rounded-lg transition-all duration-150 hover:bg-white/10"
                      title="Download"
                    >
                      <Download size={14} color="#f5f6f7" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setList((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                      className="p-1.5 rounded-lg transition-all duration-150 hover:bg-white/10"
                      title="Delete"
                    >
                      <Trash2 size={14} color="#f5f6f740" />
                    </button>
                  </div>

                  {/* ACTIONS - Mobile */}
                  <div className="flex sm:hidden items-center gap-2 mt-2">
                    <button
                      onClick={() => openPreview(r)}
                      className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150"
                      style={{ background: "#D4B48320", color: "#D4B483" }}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => downloadReport(r)}
                      className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150"
                      style={{ background: "#3a6f7720", color: "#3a6f77" }}
                    >
                      Download
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setList((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                      className="px-3 py-1.5 rounded-lg transition-all duration-150"
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

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSelectedReport(null)}>
          <div
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#2f2f33] p-5 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#f5f6f740]">Report Preview</p>
                <h2 className="mt-1 text-xl font-bold text-[#f5f6f7]">{selectedReport.title}</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#f5f6f7] transition-all duration-150 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-[#f5f6f7]">
              <p><span className="text-[#f5f6f740]">Type:</span> {selectedReport.subtitle}</p>
              <p><span className="text-[#f5f6f740]">Period:</span> {selectedReport.period}</p>
              <p><span className="text-[#f5f6f740]">Generated:</span> {selectedReport.generated}</p>
              <p><span className="text-[#f5f6f740]">Size:</span> {selectedReport.size}</p>
              <p><span className="text-[#f5f6f740]">Pages:</span> {selectedReport.pages}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
