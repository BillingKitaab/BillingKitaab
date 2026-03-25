import Invoices from "@/component/ui/Invoices";
import Sidebar from "@/component/ui/Sidebar";
import React from "react";

const page = () => {
  return (
    <div className="flex">
      <Sidebar />
      <Invoices />
    </div>
  );
};

export default page;
