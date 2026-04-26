'use client'

import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaBell, FaEdit, FaTrash } from 'react-icons/fa';

const Sidebar = () => {
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className="bg-[#2f2f33]/90 min-h-screen w-full flex flex-col md:flex-row font-poppins">
      {/* Sidebar Section */}
      <div className="w-full md:w-64 p-6 text-[#f5f6f7] flex flex-col">
        {/* Logo + Dashboard */}
        <div className="flex items-center space-x-3 mb-8">
          <img src="/logo/smart.svg" alt="Logo" className="h-10 w-auto" />
          <h2 className="text-xl font-bold text-[#D4B483]/90 font-playfair">
            Dashboard
          </h2>
        </div>

        {/* Sidebar Options */}
        <ul className="space-y-4">
          {/* User Profile with expand icon */}
          <li
            className="flex items-center justify-between cursor-pointer hover:text-[#f5f6f7]/50"
            onClick={() => setOpenProfile(!openProfile)}
          >
            <span>User Profile</span>
            {openProfile ? <FaChevronDown /> : <FaChevronRight />}
          </li>

          {/* Sub-options visible only when User Profile is open */}
          {openProfile && (
            <ul className="ml-6 space-y-2 font-poppins">
              <li className="hover:text-[#D4B483]/90 cursor-pointer">Onboarding</li>
              <li className="hover:text-[#D4B483]/90 cursor-pointer">Exit</li>
              <li className="hover:text-[#D4B483]/90 cursor-pointer">Login Activity</li>
              <li className="hover:text-[#D4B483]/90 cursor-pointer">User Profile</li>
            </ul>
          )}

          {/* Other fixed options */}
          <li className="hover:text-[#3a6f77]/90 cursor-pointer">Best Seller Product</li>
          <li className="hover:text-[#3a6f77]/90 cursor-pointer">Invoice</li>
        </ul>
      </div>

      {/* Page Section beside Sidebar with gap and white background */}
      <div className="flex-1 p-6 md:ml-8 bg-white rounded-lg shadow-md">
        {/* Top bar with onboarding left, filter center, bell right */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#2f2f33]/90 text-white p-4 rounded-xl mb-6">
          {/* Onboarding Number (Left) */}
          <div className="text-[#f5f6f7] font-bold mb-4 md:mb-0">
            Onboarding : <span className="text-[#f5f6f7]/90">20</span>
          </div>

          {/* Filter by Date (Center) */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-sm font-semibold text-[#f5f6f7]">Filter:</span>
            <input
              type="date"
              className="bg-[#f5f6f7] text-[#2f2f33] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4B483]/90"
            />
          </div>

          {/* Bell Icon (Right) */}
          <FaBell className="text-yellow-400 text-2xl cursor-pointer hover:text-[#D4B483]/90" />
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-[#2f2f33]/90 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Onboarding Date</th>
                <th className="px-4 py-2 text-left">Registration Type</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">kunal</td>
                <td className="px-4 py-2">2026-04-25</td>
                <td className="px-4 py-2">login</td>
                <td className="px-4 py-2 flex space-x-4">
                  <FaEdit className="text-blue-500 cursor-pointer hover:text-blue-700" />
                  <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">user2</td>
                <td className="px-4 py-2">2026-04-20</td>
                <td className="px-4 py-2">google</td>
                <td className="px-4 py-2 flex space-x-4">
                  <FaEdit className="text-blue-500 cursor-pointer hover:text-blue-700" />
                  <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
