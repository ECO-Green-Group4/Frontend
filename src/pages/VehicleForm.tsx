import React, { useState } from "react";

// Định nghĩa Interface cho Dữ liệu Form (State)
interface VehicleData {
  postType: string;
  carBrand: string;
  year: string;
  modelTrim: string;
  origin: string;
  bodyType: string;
  numberOfSeats: string;
  color: string;
  licensePlate: string;
  mileage: string;
  accessories: string;
  inspection: string;
  price: string;
  description: string;
  images: File[];
}

// Định nghĩa Interface cho Props của Component
interface VehicleFormProps {
  onSubmit: (data: VehicleData) => void;
}

export default function VehicleForm({ onSubmit }: VehicleFormProps) {
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    postType: "",
    carBrand: "",
    year: "",
    modelTrim: "",
    origin: "",
    bodyType: "",
    numberOfSeats: "",
    color: "",
    licensePlate: "",
    mileage: "",
    accessories: "",
    inspection: "",
    price: "",
    description: "",
    images: [] as File[],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setVehicleData({ ...vehicleData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVehicleData({
        ...vehicleData,
        images: Array.from(e.target.files) as File[],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(vehicleData);
    onSubmit(vehicleData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200">
      
      

      {/* Dropdown Loại Xe (EV - Electric Vehicle) đã chuyển thành thẻ <div> tĩnh */}
      <div className="mb-6">
        <div
          className="w-full border border-emerald-500 bg-emerald-50 text-emerald-800 rounded-lg p-3 font-semibold flex items-center"
        >
          EV - Electric Vehicle 
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
      >
        {/* POST TYPE */}
        <div className="col-span-2">
          <label className="block mb-1 font-bold text-gray-700">Post Type</label>
          <select
            name="postType"
            value={vehicleData.postType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
          >
            <option value="">Select post type</option>
            <option value="Regular">Regular Post</option>
            <option value="VIP Silver">VIP Silver</option>
            <option value="VIP Gold">VIP Gold</option>
          </select>
        </div>

        {/* BASIC VEHICLE INFO HEADER */}
        <h3 className="col-span-2 text-xl font-bold text-gray-700 border-b pb-2 mb-4 mt-6">
          Vehicle Details
        </h3>

        {/* Car Brand */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Car Brand</label>
          <input
            name="carBrand"
            value={vehicleData.carBrand}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="VinFast, Tesla, Yadea..."
          />
        </div>

        {/* Year */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Year</label>
          <input
            type="number"
            name="year"
            value={vehicleData.year}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="2024"
          />
        </div>

        {/* Model Trim */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Model Trim</label>
          <input
            name="modelTrim"
            value={vehicleData.modelTrim}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="VF e34, Model 3..."
          />
        </div>

        {/* Origin */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Origin</label>
          <input
            name="origin"
            value={vehicleData.origin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Vietnam, China, Japan..."
          />
        </div>

        {/* Body Type */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Body Type</label>
          <input
            name="bodyType"
            value={vehicleData.bodyType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="SUV, Sedan, Scooter..."
          />
        </div>

        {/* Number of Seats */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">
            Number of Seats
          </label>
          <input
            type="number"
            name="numberOfSeats"
            value={vehicleData.numberOfSeats}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="2 / 4 / 5"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Color</label>
          <input
            name="color"
            value={vehicleData.color}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Red, Blue, White..."
          />
        </div>

        {/* License Plate */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">
            License Plate
          </label>
          <input
            name="licensePlate"
            value={vehicleData.licensePlate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="51F-123.45"
          />
        </div>

        {/* Mileage (km) */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">
            Mileage (km)
          </label>
          <input
            type="number"
            name="mileage"
            value={vehicleData.mileage}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="5000"
          />
        </div>

        {/* Accessories */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">
            Accessories
          </label>
          <input
            name="accessories"
            value={vehicleData.accessories}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Helmet, charger, etc."
          />
        </div>

        {/* Inspection */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">
            Inspection
          </label>
          <input
            name="inspection"
            value={vehicleData.inspection}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Yes / No / Until 2025"
          />
        </div>

        {/* Price (VND) */}
        <div className="col-span-2">
          <label className="block mb-1 font-bold text-gray-700">
            Price (VND)
          </label>
          <input
            type="number"
            name="price"
            value={vehicleData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="50000000"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="col-span-2">
          <label className="block mb-1 font-bold text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={vehicleData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Describe the condition, features, or notes..."
            rows={4}
          ></textarea>
        </div>

        {/* UPLOAD IMAGES */}
        <div className="col-span-2">
          <label className="block mb-1 font-bold text-gray-700">
            Upload Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
        </div>

        {/* SUBMIT */}
        <div className="col-span-2 text-center mt-4">
          <button
            type="submit"
            className="bg-green-500 text-white py-3 px-12 rounded-full font-bold text-lg hover:bg-green-500 transition transform hover:scale-[1.02] shadow-lg shadow-emerald-200"
          >
            Create Post
          </button>
        </div>
      </form>
    </div>
  );
}