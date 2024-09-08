import React, { useEffect, useState } from "react";

interface CartItem {
  _id: string;
  price: number;
  quantity: number;
  colorName: string;
  colorImage: string;
  fabricName: string;
  frontPocketName: string;
  backPocketName: string;
  waist: number;
  length: number;
}

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  street: string;
  state: string;
  postalCode: string;
  note: string;
  cartItems: CartItem[];
  totalPrice: number;
}

const SaleOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
         setLoading(true);
        const res = await fetch("/api/sales");
        const data = await res.json();
        setLoading(false);
        setOrders(data.order); // Assuming data.order is an array
      } catch (error) {
        console.error("Error fetching sales orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center  z-50">
          <div className="text-black text-xl">Loading...</div>
        </div>
      )}
      <h2 className="text-2xl font-bold text-black mb-4">Sale Orders</h2>
      <div className="flex flex-col gap-4 justify-around">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-black mb-12 text-white shadow-md rounded-md p-4 w-full h-auto"
          >
            {/* Customer Information Section */}
            <div className="mb-4">
              <h3 className="text-xl font-bold">Customer Information</h3>
              <p>
                Name: {order.firstName} {order.lastName}
              </p>
              <p>Email: {order.email}</p>
              <p>Phone: {order.phoneNumber}</p>
              <p>
                Address: {order.street}, {order.city}, {order.state},{" "}
                {order.postalCode}
              </p>
            </div>

            {/* Order Note Section */}
            {order.note && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold">Note:</h4>
                <p>{order.note}</p>
              </div>
            )}

            {/* Cart Items Section */}
            <div className="mb-4">
              <h3 className="text-xl font-bold">Cart Items</h3>
              {order.cartItems.map((item) => (
                <div
                  key={item._id}
                  className="border-t border-gray-300 mt-2 pt-2"
                >
                  <div className="flex justify-between items-center mb-2">
                    <img
                      src={item.colorImage}
                      alt={item.colorName}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <p>Color: {item.colorName}</p>
                      <p>Fabric: {item.fabricName}</p>
                      <p>Price: ${item.price}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold">Details:</h4>
                    <p>Waist: {item.waist}</p>
                    <p>Length: {item.length}</p>
                    <p>Back Pocket: {item.backPocketName}</p>
                    <p>Front Pocket: {item.frontPocketName}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price Section */}
            <div className="mt-4">
              <h3 className="text-xl font-bold">Total Price</h3>
              <p className="text-lg">${order.totalPrice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaleOrder;
