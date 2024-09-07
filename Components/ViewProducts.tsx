"use client";

import React, { useEffect, useState } from "react";
import crypto from "crypto";

interface ImageOption {
  url: string;
  name: string;
  publicId: string;
}

interface Product {
  _id: string;
  colorImage: string;
  colorName: string;
  colorImagePublicId: string;
  price: number;
  disc: string;
  fabrics: ImageOption[];
  frontPockets: ImageOption[];
  backPockets: ImageOption[];
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noProductsMessage, setNoProductsMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        setLoading(false);
        const fetchedProducts = data.jean;
        setProducts(fetchedProducts);
        setNoProductsMessage(fetchedProducts.length === 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const confirmDelete = (id: string) => {
    setDeleteProductId(id);
    setShowDeleteConfirm(true);
  };

  const generateSignature = (publicId: string, timestamp: string) => {
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET!;
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    return crypto.createHash("sha1").update(signatureString).digest("hex");
  };

  const deleteImagesFromCloudinary = async (publicIds: string[]) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString(); // Current Unix timestamp

      for (const publicId of publicIds) {
        const formData = new FormData();
        formData.append("public_id", publicId);
        formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
        formData.append("timestamp", timestamp);
        formData.append("signature", generateSignature(publicId, timestamp));

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/destroy`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (result.result === "ok") {
          console.log(`Image ${publicId} deleted successfully`);
        } else {
          console.error(`Error deleting image ${publicId}:`, result);
        }
      }
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  };

  const handleDelete = async () => {
    try {
    setShowDeleteConfirm(false);
     setLoading(true);
      const response = await fetch(`/api/products/${deleteProductId}`);
      const data = await response.json();
      const product = data.jean;

      // Extract public IDs
      const publicIds = [
        product.colorImagePublicId,
        ...product.fabrics.map(
          (fabric: { publicId: string }) => fabric.publicId
        ),
        ...product.frontPockets.map(
          (frontPocket: { publicId: string }) => frontPocket.publicId
        ),
        ...product.backPockets.map(
          (backPocket: { publicId: string }) => backPocket.publicId
        ),
      ].filter(Boolean); // Filter out any undefined or null values

      console.log("Public IDs:", publicIds);

      // Delete images from Cloudinary
      await deleteImagesFromCloudinary(publicIds);

      // Delete product from database
      const deleteResponse = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      });

      if (deleteResponse.ok) {
         setLoading(false);
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.filter(
            (product) => product._id !== deleteProductId
          );
          setNoProductsMessage(updatedProducts.length === 0);
          
          return updatedProducts;
        });
        
      } else {
        console.error("Error deleting product:", await deleteResponse.text());
      }
    } catch (error) {
      console.error("Error handling delete:", error);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center  z-50">
          <div className="text-black text-xl">Loading...</div>
        </div>
      )}
      <section className="text-white body-font">
        <div className="container px-5 py-24 mx-auto">
          {noProductsMessage ? (
            <div className="text-center">
              <h2 className="text-lg text-black font-semibold">
                No products available
              </h2>
            </div>
          ) : (
            <div className="flex flex-wrap -m-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="lg:w-1/2 md:w-1/2 p-4 w-full "
                >
                  <div className="block relative h-48 overflow-hidden ">
                    <img
                      alt={product.colorName}
                      className="object-cover object-center w-full h-full block"
                      src={product.colorImage}
                    />
                  </div>
                  <div className="p-4 bg-black">
                    <h3 className="text-xs tracking-widest title-font mb-1">
                      {product.colorName}
                    </h3>
                    <h2 className="title-font text-lg font-medium">
                      {product.colorName}
                    </h2>
                    <p className="mt-1">${product.price}</p>

                    {/* Edit and Delete Buttons */}
                    <button
                      onClick={() => confirmDelete(product._id)}
                      className="py-1 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-all duration-300"
                    >
                      Delete Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4">
                Are you sure you want to delete this product?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md mr-2"
                >
                  No
                </button>
                <button
                  onClick={handleDelete}
                  className="py-2 px-4 bg-red-600 text-white rounded-md"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
