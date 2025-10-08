import React, { useState } from "react";

// 1. Định nghĩa Interface cho Dữ liệu Pin (State)
interface BatteryData {
  postType: string;
  brand: string;
  voltage: string;      
  capacity: string;
  soh: string;          
  cycles: string;       
  type: string;         
  origin: string;
  temperature: string;
  description: string;
  images: File[];
}

// 2. Định nghĩa Interface cho Props của Component
interface BatteryFormProps {
  onSubmit: (data: BatteryData) => void;
}

// Định nghĩa chung cho styling input và label
const inputClass = "w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150";
const labelClass = "block mb-1 font-bold text-gray-700";

export default function BatteryForm({ onSubmit }: BatteryFormProps) {
  // Khởi tạo state với kiểu BatteryData
  const [batteryData, setBatteryData] = useState<BatteryData>({
    postType: "",
    brand: "",
    voltage: "",
    capacity: "",
    soh: "",
    cycles: "",
    type: "",
    origin: "",
    temperature: "",
    description: "",
    images: [] as File[],
  });

  // Handlers 
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setBatteryData({ ...batteryData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBatteryData({ 
        ...batteryData, 
        images: Array.from(e.target.files) as File[] 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(batteryData);
    onSubmit(batteryData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200">
      
      
      
      {/* DROPDOWN CHÍNH "Battery" (Giữ lại phần code này) */}
      <div className="mb-6">
        <div
          className="w-full border border-emerald-500 bg-emerald-50 text-emerald-800 rounded-lg p-3 font-semibold flex items-center"
        >
          Battery 
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
      >
        {/* Post Type (Regular / VIP Silver / VIP Gold) */}
        <div className="col-span-2">
          <label className={labelClass}>Post Type</label>
          <select
            name="postType"
            value={batteryData.postType}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Post Type</option>
            <option value="Regular">Regular Post</option>
            <option value="VIP Silver">VIP Silver Post</option>
            <option value="VIP Gold">VIP Gold Post</option>
          </select>
        </div>

        {/* Battery Details Header */}
        <h3 className="col-span-2 text-xl font-bold text-gray-700 border-b pb-2 mb-4 mt-2">
          Battery Details
        </h3>

        {/* Battery Brand */}
        <div>
          <label className={labelClass}>Battery Brand</label>
          <input
            name="brand"
            value={batteryData.brand}
            onChange={handleChange}
            className={inputClass}
            placeholder="VinFast, CATL, LG..."
          />
        </div>

        {/* Voltage (V) */}
        <div>
          <label className={labelClass}>Voltage (V)</label>
          <input
            type="number"
            name="voltage"
            value={batteryData.voltage}
            onChange={handleChange}
            className={inputClass}
            placeholder="72"
          />
        </div>

        {/* Capacity (Ah / Wh) */}
        <div>
          <label className={labelClass}>Capacity (Ah / Wh)</label>
          <input
            name="capacity"
            value={batteryData.capacity}
            onChange={handleChange}
            className={inputClass}
            placeholder="32Ah or 2000Wh"
          />
        </div>

        {/* SoH (%) */}
        <div>
          <label className={labelClass}>SoH (%)</label>
          <input
            type="number"
            name="soh"
            value={batteryData.soh}
            onChange={handleChange}
            className={inputClass}
            placeholder="85"
          />
        </div>

        {/* Charge Cycles */}
        <div>
          <label className={labelClass}>Charge Cycles</label>
          <input
            type="number"
            name="cycles"
            value={batteryData.cycles}
            onChange={handleChange}
            className={inputClass}
            placeholder="300"
          />
        </div>

        {/* Battery Type */}
        <div>
          <label className={labelClass}>Battery Type</label>
          <select
            name="type"
            value={batteryData.type}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Type</option>
            <option value="LFP">LFP</option>
            <option value="NMC">NMC</option>
            <option value="Li-ion">Li-ion</option>
            <option value="Lead-acid">Lead-acid</option>
          </select>
        </div>

        {/* Origin */}
        <div>
          <label className={labelClass}>Origin</label>
          <input
            name="origin"
            value={batteryData.origin}
            onChange={handleChange}
            className={inputClass}
            placeholder="China, Vietnam, Korea..."
          />
        </div>

        {/* Temperature (°C) */}
        <div>
          <label className={labelClass}>Temperature (°C)</label>
          <input
            type="number"
            name="temperature"
            value={batteryData.temperature}
            onChange={handleChange}
            className={inputClass}
            placeholder="28"
          />
        </div>

        {/*  Description */}
        <div className="col-span-2">
          <label className={labelClass}>Post Description</label>
          <textarea
            name="description"
            value={batteryData.description}
            onChange={handleChange}
            className={`${inputClass} h-32`} 
            placeholder="Describe battery condition, warranty, etc."
            rows={4}
          ></textarea>
        </div>

        {/*  Upload Images */}
        <div className="col-span-2">
          <label className={labelClass}>Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
        </div>

        {/*  SUBMIT */}
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