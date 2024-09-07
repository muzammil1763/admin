"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

interface ProductForm {
  colorName: string;
  colorImage: File | null;
  colorImageName: string;
  disc: string;
  price: number;
  category: string;
  fabrics: { file: File | null; name: string }[];
  frontPockets: { file: File | null; name: string }[];
  backPockets: { file: File | null; name: string }[];
}

const ProductForm: React.FC = () => {
  
  const [formData, setFormData] = useState<ProductForm>({
    colorName: "",
    colorImage: null,
    colorImageName: "",
    disc: "",
    price: 0,
    category: "Male",
    fabrics: [{ file: null, name: "" }],
    frontPockets: [{ file: null, name: "" }],
    backPockets: [{ file: null, name: "" }],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, files } = e.target as HTMLInputElement;
    const [type, index] = id.split("-");

    if (type === "colorImage") {
      setFormData((prevData) => ({
        ...prevData,
        colorImage: files ? files[0] : null,
      }));
    } else if (type === "colorImageName") {
      setFormData((prevData) => ({
        ...prevData,
        colorImageName: value,
      }));
    } else if (type === "category") {
      setFormData((prevData) => ({
        ...prevData,
        category: value,
      }));
    } else if (type.startsWith("fabric")) {
      const idx = Number(index);
      const updatedFabrics = [...formData.fabrics];
      if (id.startsWith("fabricFile")) {
        updatedFabrics[idx] = {
          ...updatedFabrics[idx],
          file: files ? files[0] : null,
        };
      } else if (id.startsWith("fabricName")) {
        updatedFabrics[idx] = { ...updatedFabrics[idx], name: value };
      }
      setFormData((prevData) => ({ ...prevData, fabrics: updatedFabrics }));
    } else if (type.startsWith("frontPocket")) {
      const idx = Number(index);
      const updatedFrontPockets = [...formData.frontPockets];
      if (id.startsWith("frontPocketFile")) {
        updatedFrontPockets[idx] = {
          ...updatedFrontPockets[idx],
          file: files ? files[0] : null,
        };
      } else if (id.startsWith("frontPocketName")) {
        updatedFrontPockets[idx] = { ...updatedFrontPockets[idx], name: value };
      }
      setFormData((prevData) => ({
        ...prevData,
        frontPockets: updatedFrontPockets,
      }));
    } else if (type.startsWith("backPocket")) {
      const idx = Number(index);
      const updatedBackPockets = [...formData.backPockets];
      if (id.startsWith("backPocketFile")) {
        updatedBackPockets[idx] = {
          ...updatedBackPockets[idx],
          file: files ? files[0] : null,
        };
      } else if (id.startsWith("backPocketName")) {
        updatedBackPockets[idx] = { ...updatedBackPockets[idx], name: value };
      }
      setFormData((prevData) => ({
        ...prevData,
        backPockets: updatedBackPockets,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleAddMore = (type: "fabrics" | "frontPockets" | "backPockets") => {
    setFormData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], { file: null, name: "" }],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.colorImage) return;

    setLoading(true);

    const uploadImage = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_PRESET!);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      const cloud = process.env.NEXT_PUBLIC_CLOUD_NAME!;

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return { url: data.secure_url, publicId: data.public_id };
    };

    try {
      const colorImageData = await uploadImage(formData.colorImage);

      const fabricUrls = await Promise.all(
        formData.fabrics.map(async (fabric) =>
          fabric.file ? await uploadImage(fabric.file) : null
        )
      );

      const frontPocketUrls = await Promise.all(
        formData.frontPockets.map(async (frontPocket) =>
          frontPocket.file ? await uploadImage(frontPocket.file) : null
        )
      );

      const backPocketUrls = await Promise.all(
        formData.backPockets.map(async (backPocket) =>
          backPocket.file ? await uploadImage(backPocket.file) : null
        )
      );

      const productData = {
        colorName: formData.colorName,
        colorImage: colorImageData.url,
        colorImagePublicId: colorImageData.publicId,
        colorImageName: formData.colorImageName,
        disc: formData.disc,
        price: formData.price,
        category: formData.category,
        fabrics: fabricUrls.filter((url) => url !== null),
        frontPockets: frontPocketUrls.filter((url) => url !== null),
        backPockets: backPocketUrls.filter((url) => url !== null),
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            colorName: "",
            colorImage: null,
            colorImageName: "",
            disc: "",
            price: 0,
            category: "Male",
            fabrics: [{ file: null, name: "" }],
            frontPockets: [{ file: null, name: "" }],
            backPockets: [{ file: null, name: "" }],
          });
           (
             document.querySelectorAll(
               'input[type="file"]'
             ) as NodeListOf<HTMLInputElement>
           ).forEach((input) => (input.value = ""));
        }, 3000);
      } else {
        alert("Error submitting product.");
      }
    } catch (error) {
      alert("Error uploading images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center  z-50">
          <div className="text-black text-xl">Loading...</div>
        </div>
      )}
      {success && (
        <div className="absolute inset-0 flex items-center justify-center  text-black z-50">
          <div className="p-4 rounded-lg shadow-lg">
            Product submitted successfully!
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className=" mt-20  space-y-6 p-24 bg-black text-white  shadow-md mx-auto"
      >
        <div>
          <label
            htmlFor="colorName"
            className="block text-sm font-medium text-white"
          >
            Color Name
          </label>
          <input
            type="text"
            id="colorName"
            value={formData.colorName}
            placeholder="colorName"
            required
            onChange={handleChange}
            className="mt-1  p-1 text-black block w-full rounded-md   shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
          />
        </div>

        <div>
          <label
            htmlFor="colorImage"
            className="block text-sm font-medium text-white"
          >
            Color Image
          </label>
          <input
            type="file"
            id="colorImage"
            required
            onChange={handleChange}
            className="mt-1 block w-full p-1 text-black"
          />
        </div>

        <div>
          <label
            htmlFor="colorImageName"
            className="block text-sm font-medium text-white"
          >
            Color Image Name
          </label>
          <input
            type="text"
            id="colorImageName"
            value={formData.colorImageName}
            onChange={handleChange}
            required
            placeholder="Color Image Name"
            className="mt-1 block w-full rounded-md p-1 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
          />
        </div>

        <div>
          <label
            htmlFor="disc"
            className="block text-sm font-medium text-white"
          >
            Description
          </label>
          <input
            type="text"
            id="disc"
            value={formData.disc}
            required
            placeholder="discription"
            onChange={handleChange}
            className="mt-1 block w-full rounded-md p-1 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-white"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            value={formData.price}
            required
            placeholder="0"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: Number(e.target.value),
              }))
            }
            className="mt-1 block w-full rounded-md p-1 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-white"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md p-1 text-black  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Fabric Images
          </label>
          {formData.fabrics.map((fabric, index) => (
            <div key={index} className="mb-4">
              <input
                type="file"
                id={`fabricFile-${index}`}
                required
                onChange={handleChange}
                className="block w-full p-1 text-black"
              />
              <input
                type="text"
                id={`fabricName-${index}`}
                value={fabric.name}
                required
                onChange={handleChange}
                placeholder="Fabric Name"
                className="mt-1 block w-full rounded-md p-1 text-black  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddMore("fabrics")}
            className="text-white"
          >
            Add More Fabric Images
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Front Pocket Images
          </label>
          {formData.frontPockets.map((frontPocket, index) => (
            <div key={index} className="mb-4">
              <input
                type="file"
                id={`frontPocketFile-${index}`}
                required
                onChange={handleChange}
                className="block w-full text-white"
              />
              <input
                type="text"
                id={`frontPocketName-${index}`}
                required
                value={frontPocket.name}
                onChange={handleChange}
                placeholder="Front Pocket Name"
                className="mt-1 block w-full rounded-md p-1 text-black  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddMore("frontPockets")}
            className="text-white"
          >
            Add More Front Pocket Images
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Back Pocket Images
          </label>
          {formData.backPockets.map((backPocket, index) => (
            <div key={index} className="mb-4">
              <input
                type="file"
                id={`backPocketFile-${index}`}
                required
                onChange={handleChange}
                className="block w-full text-white"
              />
              <input
                type="text"
                id={`backPocketName-${index}`}
                required
                value={backPocket.name}
                onChange={handleChange}
                placeholder="Back Pocket Name"
                className="mt-1 block w-full p-1 text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm "
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddMore("backPockets")}
            className="text-white"
          >
            Add More Back Pocket Images
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded-md shadow-md hover:bg-black hover:text-white"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
