// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import AddProduct from "@/Components/AddProduct";
import ViewProducts from "@/Components/ViewProducts";
import DeleteProduct from "@/Components/DeleteProduct";
import SaleOrder from "@/Components/SaleOrder";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Components/AuthContext";

const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState("add-product");
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to login if not authenticated
    } else {
      setLoading(false); // Stop loading if authenticated
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center  z-50">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case "add-product":
        return <AddProduct />;
      case "view-products":
        return <ViewProducts />;
      case "sale-order":
        return <SaleOrder />;
      default:
        return <p>Select an option from the sidebar.</p>;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row h-screen bg-white">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black text-white flex flex-col md:rounded-l-lg m-0 md:m-4 md:shadow-lg overflow-y-auto">
          <div className="p-4 md:p-6 flex flex-col flex-grow">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <nav className="flex flex-col space-y-4">
              {["add-product", "view-products", "sale-order"].map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`text-lg py-2 px-4 rounded-md transition-colors ${
                    activePage === page ? "bg-gray-800" : "bg-black"
                  } hover:bg-gray-700`}
                >
                  {page
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </button>
              ))}
            </nav>
          </div>
          <button className="p-3 bg-red-900" onClick={logout}>
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-10 bg-white md:rounded-r-lg m-0 md:m-4 md:shadow-lg overflow-y-auto">
          <h1 className="text-black font-extrabold text-lg">Hello User!</h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
