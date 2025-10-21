import React, { useState } from "react";
import { uploadImgBBMultipleFile } from "../services/imgBB";
import ImageUploader from "../components/ImageUploader";
import { showToast } from "../utils/toast";

// 1. Interface Dữ liệu Form - ***ĐÃ SỬA***
interface BatteryData {
  title: string;
  description: string;
  location: string;
  price: string;
  batteryBrand: string; 
  voltage: string;
  capacity: string;
  healthPercent: string;
  chargeCycles: string;
  type: string; 
  manufactureYear: string;
  origin: string;
}

// 2. Interface Props (Nhận từ Cha) - ***ĐÃ SỬA***
interface BatteryFormProps {
  onSubmit: (data: any) => Promise<any>; // Phải là Promise
  packageId: number | null;     
}

// Định nghĩa chung cho styling
const inputClass = "w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150";
const labelClass = "block mb-1 font-bold text-gray-700";

// 3. Component
export default function BatteryForm({ onSubmit, packageId }: BatteryFormProps) {

 
  const [batteryData, setBatteryData] = useState<BatteryData>({
    title: "",
    description: "",
    location: "",
    price: "",
    batteryBrand: "",
    voltage: "",
    capacity: "",
    healthPercent: "",
    chargeCycles: "",
    type: "",
    manufactureYear: "",
    origin: "",
  });

  // State quản lý file ảnh
  const [images, setImages] = useState<File[]>([]);
  
  // State quản lý trạng thái uploading
  const [isUploading, setIsUploading] = useState(false);

  // 4. Handlers (Giữ nguyên)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setBatteryData({ ...batteryData, [name]: value });
  };

  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages);
  };

  // 5. Hàm Submit (Đã sửa lỗi 'quay vòng vòng')
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (packageId === null) {
      showToast.warning("Vui lòng chọn một gói đăng tin ở bên trên!");
      document.getElementById("package-selection")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    
    if (images.length === 0) {
      showToast.warning("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. Upload ảnh
      console.log("🔄 [BatteryForm] Đang upload ảnh...");
      const uploadedUrls = await uploadImgBBMultipleFile(images);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length === 0) {
        throw new Error("Không thể upload ảnh nào lên server");
      }
      console.log("✅ [BatteryForm] Upload thành công:", validUrls);
      
      // 2. Tổng hợp dữ liệu
      const finalData = {
        ...batteryData,
        images: validUrls, 
        packageId: packageId 
      };
      
      // 3. Gửi dữ liệu lên Cha VÀ CHỜ
      await onSubmit(finalData); 

    } catch (error) {
      console.error("❌ [BatteryForm] Lỗi submit:", error);
    } finally {
      // 4. LUÔN LUÔN tắt loading
      setIsUploading(false);
    }
  };

  // 6. JSX - ***ĐÃ SỬA***
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200">
      
      <div className="mb-6">
        <div className="w-full border border-emerald-500 bg-emerald-50 text-emerald-800 rounded-lg p-3 font-semibold flex items-center">
          Battery 
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
      >
        
        <h3 className="col-span-2 text-xl font-bold text-gray-700 border-b pb-2 mb-4 mt-2">
          Battery Details
        </h3>

        {/* Title */}
        <div className="col-span-2">
          <label className={labelClass}>Title</label>
          <input
            name="title"
            value={batteryData.title}
            onChange={handleChange}
            className={inputClass}
            placeholder="Pin Tesla Model 3 75kWh"
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <label className={labelClass}>Location</label>
          <input
            name="location"
            value={batteryData.location}
            onChange={handleChange}
            className={inputClass}
            placeholder="Hồ Chí Minh"
          />
        </div>

        {/* Price */}
        <div className="col-span-2">
          <label className={labelClass}>Price (VND)</label>
          <input
            type="number"
            name="price"
            value={batteryData.price}
            onChange={handleChange}
            className={inputClass}
            placeholder="50000000"
          />
        </div>


        {/* Battery Brand */}
        <div>
          <label className={labelClass}>Battery Brand</label>
          <input
            name="batteryBrand"
            value={batteryData.batteryBrand}
            onChange={handleChange}
            className={inputClass}
            placeholder="Tesla, CATL, LG..."
          />
        </div>

        {/* Voltage (V) */}
        <div>
          <label className={labelClass}>Voltage (V)</label>
          <input
            type="number" // <-- Nên đổi thành 'number' để user nhập số
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
            name="capacity" // Giữ là text vì có "Ah", "Wh"
            value={batteryData.capacity}
            onChange={handleChange}
            className={inputClass}
            placeholder="32Ah or 2000Wh"
          />
        </div>

        {/* Health Percent (%) */}
        <div>
          <label className={labelClass}>Health Percent (%)</label>
          <input
            type="number"
            name="healthPercent"
            value={batteryData.healthPercent}
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
            name="chargeCycles"
            value={batteryData.chargeCycles}
            onChange={handleChange}
            className={inputClass}
            placeholder="500"
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

        {/* Manufacture Year (của pin) */}
        <div>
          <label className={labelClass}>Manufacture Year</label>
          <input
            type="number"
            name="manufactureYear"
            value={batteryData.manufactureYear}
            onChange={handleChange}
            className={inputClass}
            placeholder="2022"
          />
        </div>

        {/* Origin (của pin) */}
        <div>
          <label className={labelClass}>Origin</label>
          <input
            name="origin"
            value={batteryData.origin}
            onChange={handleChange}
            className={inputClass}
            placeholder="USA, China, Vietnam..."
          />
        </div>

        {/* Description */}
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

        {/* Upload Images */}
        <div className="col-span-2">
          <label className={labelClass}>Upload Images</label>
          <ImageUploader
            images={images}
            onImagesChange={handleImagesChange}
            maxImages={10}
            className="mt-2"
          />
        </div>

        {/* SUBMIT */}
        <div className="col-span-2 text-center mt-4">
          <button
            type="submit"
            disabled={isUploading}
            className={`py-3 px-12 rounded-full font-bold text-lg transition transform shadow-lg ${
              isUploading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-green-500 text-white hover:bg-green-600 hover:scale-[1.02] shadow-emerald-200'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang upload ảnh...
              </div>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}