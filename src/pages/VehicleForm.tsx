import React, { useState, useEffect } from "react";
import { uploadImgBBMultipleFile } from "../services/imgBB";

// Định nghĩa Interface cho Dữ liệu Form (State)
interface VehicleData {
  title: string;
  description: string;
  images: File[];
  location: string;
  price: string;
  brand: string;
  model: string;
  year: string;
  bodyType: string;
  color: string;
  mileage: string;
  inspection: string;
  origin: string;
  numberOfSeats: string;
  licensePlate: string;
  accessories: string;
  batteryCapacity: string;
  condition: string;
  postType: string;
  
}

// Định nghĩa Interface cho Props của Component
interface VehicleFormProps {
  onSubmit: (data: VehicleData) => void;
}

export default function VehicleForm({ onSubmit }: VehicleFormProps) {
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    title: "",
    description: "",
    images: [] as File[],
    location: "",
    price: "",
    brand: "",
    model: "",
    year: "",
    bodyType: "",
    color: "",
    mileage: "",
    inspection: "",
    origin: "",
    numberOfSeats: "",
    licensePlate: "",
    accessories: "",
    batteryCapacity: "",
    condition: "",
    postType: "",
    
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
      const files = Array.from(e.target.files) as File[];
      setVehicleData({
        ...vehicleData,
        images: files,
      });
      
      // Tạo preview URLs cho tất cả ảnh
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previewUrls);
      setSelectedImageIndex(0); // Reset về ảnh đầu tiên
    }
  };

  const removeImage = (index: number) => {
    // Xóa ảnh khỏi mảng
    const newImages = vehicleData.images.filter((_, i) => i !== index);
    const newPreviewUrls = previewImages.filter((_, i) => i !== index);
    
    // Giải phóng URL cũ để tránh memory leak
    URL.revokeObjectURL(previewImages[index]);
    
    setVehicleData({ ...vehicleData, images: newImages });
    setPreviewImages(newPreviewUrls);
    
    // Điều chỉnh selectedImageIndex nếu cần
    if (selectedImageIndex >= newPreviewUrls.length) {
      setSelectedImageIndex(Math.max(0, newPreviewUrls.length - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (vehicleData.images.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload ảnh lên ImgBB
      console.log("🔄 Đang upload ảnh lên ImgBB...");
      const uploadedUrls = await uploadImgBBMultipleFile(vehicleData.images);
      
      // Lọc bỏ các URL null (upload thất bại)
      const validUrls = uploadedUrls.filter(url => url !== null);
      
      if (validUrls.length === 0) {
        throw new Error("Không thể upload ảnh nào lên server");
      }
      
      console.log("✅ Upload thành công:", validUrls);
      
      // Tạo data với URLs đã upload
      const dataWithImages = {
        ...vehicleData,
        images: validUrls // Thay thế File[] bằng string URLs
      };
      
      onSubmit(dataWithImages);
    } catch (error) {
      console.error("❌ Lỗi upload ảnh:", error);
      alert(`Lỗi upload ảnh: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup URLs khi component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200">
      {/* Dropdown Loại Xe (EV - Electric Vehicle) */}
      <div className="mb-6">
        <div className="w-full border border-emerald-500 bg-emerald-50 text-emerald-800 rounded-lg p-3 font-semibold flex items-center">
          EV - Electric Vehicle
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
      >
        
        
        {/* BASIC VEHICLE INFO HEADER */}
        <h3 className="col-span-2 text-xl font-bold text-gray-700 border-b pb-2 mb-4 mt-6">
          Vehicle Details
        </h3>

        {/* Title */}
        <div className="col-span-2">
          <label className="block mb-1 font-bold text-gray-700">Title</label>
          <input
            name="title"
            value={vehicleData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Tesla Model 3 2022"
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <label className="block mb-1 font-bold text-gray-700">Location</label>
          <input
            name="location"
            value={vehicleData.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="Hồ Chí Minh"
          />
        </div>

        {/* Car Brand */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Car Brand</label>
          <input
            name="brand"
            value={vehicleData.brand}
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

        {/* Model */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Model</label>
          <input
            name="model"
            value={vehicleData.model}
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

        {/* Inspection + Battery Capacity */}
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

        {/* ✅ Battery Capacity (kWh) */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">
            Battery Capacity (kWh)
          </label>
          <input
            type="number"
            name="batteryCapacity"
            value={vehicleData.batteryCapacity}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="50"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Condition</label>
          <input
            name="condition"
            value={vehicleData.condition}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
            placeholder="excellent, good, fair"
          />
        </div>

        {/* Post Type */}
        <div>
          <label className="block mb-1 font-bold text-gray-700">Post Type</label>
          <select
            name="postType"
            value={vehicleData.postType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150"
          >
            <option value="">Select Post Type</option>
            <option value="vip-kim-cuong">Vip Kim cương</option>
            <option value="vip-vang">Vip vàng</option>
            <option value="standard">Standard</option>
          </select>
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
          
          {/* Preview Images - Layout nằm ngang */}
          {previewImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Preview ({previewImages.length} ảnh):
              </p>
              
              <div className="flex gap-4">
                {/* Ảnh chính lớn bên trái */}
                <div className="flex-1">
                  <div className="relative">
                    <img
                      src={previewImages[selectedImageIndex]}
                      alt={`Preview ${selectedImageIndex + 1}`}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(selectedImageIndex)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {/* Grid ảnh nhỏ bên phải */}
                <div className="w-32 space-y-2">
                  {previewImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-full h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                          index === selectedImageIndex 
                            ? 'border-emerald-500 ring-2 ring-emerald-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
