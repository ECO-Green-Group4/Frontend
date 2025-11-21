import React, { useState } from "react";
import { uploadImgBBMultipleFile } from "../services/imgBB";
import ImageUploader from "../components/ImageUploader";
import { showToast } from "@/utils/toast";

// 1. Interface Dữ liệu Form
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
}

// 2. Interface Props (  nhận từ Cha) 
interface VehicleFormProps {
  onSubmit: (data: any) => Promise<any>; 
  packageId: number | null;     // Gói tin user đã chọn ở Cha
}


const inputClass = "w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150";
const labelClass = "block mb-1 font-bold text-gray-700";

// 3. Component
export default function VehicleForm({ onSubmit, packageId }: VehicleFormProps) {
  
 
  const [vehicleData, setVehicleData] = useState<Omit<VehicleData, 'images'>>({
    title: "",
    description: "",
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
  });

  // State quản lý file ảnh
  const [images, setImages] = useState<File[]>([]);
  
  // State quản lý trạng thái uploading (riêng của form này)
  const [isUploading, setIsUploading] = useState(false);

  // 4. Handlers (Quản lý state nội bộ)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setVehicleData({ ...vehicleData, [name]: value });
  };

  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages);
  };

  // 5. Hàm Submit (Xử lý logic của form này) - ***ĐÃ SỬA***
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check 1: Phải chọn gói tin (gói tin lấy từ Cha)
    if (packageId === null) {
      showToast("Vui lòng chọn một gói đăng tin ở bên trên!", "warning");
      document.getElementById("package-selection")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Check 2: Validation các trường bắt buộc
    if (!vehicleData.title || !vehicleData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề xe", "error");
      return;
    }

    if (!vehicleData.description || !vehicleData.description.trim()) {
      showToast("Vui lòng nhập mô tả xe", "error");
      return;
    }

    if (!vehicleData.price || !vehicleData.price.trim() || Number(vehicleData.price.trim()) <= 0) {
      showToast("Vui lòng nhập giá xe hợp lệ", "error");
      return;
    }

    if (!vehicleData.location || !vehicleData.location.trim()) {
      showToast("Vui lòng nhập địa điểm", "error");
      return;
    }

    if (!vehicleData.brand || !vehicleData.brand.trim()) {
      showToast("Vui lòng nhập thương hiệu xe", "error");
      return;
    }

    if (!vehicleData.model || !vehicleData.model.trim()) {
      showToast("Vui lòng nhập model xe", "error");
      return;
    }

    if (!vehicleData.year || !vehicleData.year.trim() || Number(vehicleData.year.trim()) <= 0) {
      showToast("Vui lòng nhập năm sản xuất hợp lệ", "error");
      return;
    }

    if (!vehicleData.bodyType || !vehicleData.bodyType.trim()) {
      showToast("Vui lòng nhập loại thân xe", "error");
      return;
    }

    if (!vehicleData.color || !vehicleData.color.trim()) {
      showToast("Vui lòng nhập màu sắc xe", "error");
      return;
    }

    if (!vehicleData.mileage || !vehicleData.mileage.trim() || Number(vehicleData.mileage.trim()) < 0) {
      showToast("Vui lòng nhập số km đã đi hợp lệ", "error");
      return;
    }

    if (!vehicleData.inspection || !vehicleData.inspection.trim()) {
      showToast("Vui lòng nhập thông tin kiểm định", "error");
      return;
    }

    if (!vehicleData.origin || !vehicleData.origin.trim()) {
      showToast("Vui lòng nhập xuất xứ", "error");
      return;
    }

    if (!vehicleData.numberOfSeats || !vehicleData.numberOfSeats.trim() || Number(vehicleData.numberOfSeats.trim()) <= 0) {
      showToast("Vui lòng nhập số chỗ ngồi hợp lệ", "error");
      return;
    }

    if (!vehicleData.batteryCapacity || !vehicleData.batteryCapacity.trim() || Number(vehicleData.batteryCapacity.trim()) <= 0) {
      showToast("Vui lòng nhập dung lượng pin hợp lệ", "error");
      return;
    }

    if (!vehicleData.condition || !vehicleData.condition.trim()) {
      showToast("Vui lòng nhập tình trạng xe", "error");
      return;
    }
    
    // Check 3: Phải có ảnh (BẮT BUỘC)
    if (images.length === 0) {
      showToast("Vui lòng upload ít nhất một ảnh! Ảnh là bắt buộc để tạo bài đăng.", "error");
      // Scroll đến phần upload ảnh
      document.querySelector('[name="title"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. Upload ảnh
      console.log("🔄 [VehicleForm] Đang upload ảnh...");
      const uploadedUrls = await uploadImgBBMultipleFile(images);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length === 0) {
        throw new Error("Không thể upload ảnh nào lên server");
      }
      console.log("✅ [VehicleForm] Upload thành công:", validUrls);
      
      // 2. Tổng hợp dữ liệu
      const finalData = {
        ...vehicleData,
        images: validUrls, // Gửi đi string URLs
        packageId: packageId // Gói tin từ Cha
      };
      
      // 3. Gửi dữ liệu tổng hợp lên Cha VÀ CHỜ
      await onSubmit(finalData); // <-- SỬA: Thêm 'await'

    } catch (error) {
      console.error("❌ [VehicleForm] Lỗi submit:", error);
      // 'onSubmit' của cha đã có alert lỗi rồi, nên ở đây có thể không cần alert
      // alert(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // 4. LUÔN LUÔN tắt loading sau khi 'await onSubmit' xong (dù lỗi hay không)
      setIsUploading(false); // <-- SỬA: Chuyển vào finally
    }
  };

  // 6. JSX
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200">
      {/* Box xanh "EV - Electric Vehicle" */}
      <div className="mb-6">
        <div className="w-full border border-emerald-500 bg-emerald-50 text-emerald-800 rounded-lg p-3 font-semibold flex items-center">
          EV - Electric Vehicle
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
      >
        
        <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mt-6">
          <p className="text-sm text-blue-800">
            <span className="font-bold">Lưu ý:</span> Các trường có dấu <span className="text-red-500 font-bold">*</span> là bắt buộc. Vui lòng điền đầy đủ thông tin trước khi tạo bài đăng.
          </p>
        </div>

        <h3 className="col-span-2 text-xl font-bold text-gray-700 border-b pb-2 mb-4">
          Vehicle Details
        </h3>

        {/* Title */}
        <div className="col-span-2">
          <label className={labelClass}>Title <span className="text-red-500">*</span></label>
          <input
            name="title"
            value={vehicleData.title}
            onChange={handleChange}
            className={inputClass}
            placeholder="Tesla Model 3 2022"
            required
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <label className={labelClass}>Location <span className="text-red-500">*</span></label>
          <input
            name="location"
            value={vehicleData.location}
            onChange={handleChange}
            className={inputClass}
            placeholder="Hồ Chí Minh"
            required
          />
        </div>

        {/* Car Brand */}
        <div>
          <label className={labelClass}>Car Brand <span className="text-red-500">*</span></label>
          <input
            name="brand"
            value={vehicleData.brand}
            onChange={handleChange}
            className={inputClass}
            placeholder="VinFast, Tesla, Yadea..."
            required
          />
        </div>

        {/* Year */}
        <div>
          <label className={labelClass}>Year <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="year"
            value={vehicleData.year}
            onChange={handleChange}
            className={inputClass}
            placeholder="2024"
            required
          />
        </div>

        {/* Model */}
        <div>
          <label className={labelClass}>Model <span className="text-red-500">*</span></label>
          <input
            name="model"
            value={vehicleData.model}
            onChange={handleChange}
            className={inputClass}
            placeholder="VF e34, Model 3..."
            required
          />
        </div>

        {/* Origin */}
        <div>
          <label className={labelClass}>Origin <span className="text-red-500">*</span></label>
          <input
            name="origin"
            value={vehicleData.origin}
            onChange={handleChange}
            className={inputClass}
            placeholder="Vietnam, China, Japan..."
            required
          />
        </div>

        {/* Body Type */}
        <div>
          <label className={labelClass}>Body Type <span className="text-red-500">*</span></label>
          <input
            name="bodyType"
            value={vehicleData.bodyType}
            onChange={handleChange}
            className={inputClass}
            placeholder="SUV, Sedan, Scooter..."
            required
          />
        </div>

        {/* Number of Seats */}
        <div>
          <label className={labelClass}>Number of Seats <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="numberOfSeats"
            value={vehicleData.numberOfSeats}
            onChange={handleChange}
            className={inputClass}
            placeholder="2 / 4 / 5"
            required
          />
        </div>

        {/* Color */}
        <div>
          <label className={labelClass}>Color <span className="text-red-500">*</span></label>
          <input
            name="color"
            value={vehicleData.color}
            onChange={handleChange}
            className={inputClass}
            placeholder="Red, Blue, White..."
            required
          />
        </div>

        {/* License Plate */}
        <div>
          <label className={labelClass}>License Plate</label>
          <input
            name="licensePlate"
            value={vehicleData.licensePlate}
            onChange={handleChange}
            className={inputClass}
            placeholder="51F-123.45 (Optional)"
          />
        </div>

        {/* Mileage (km) */}
        <div>
          <label className={labelClass}>Mileage (km) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="mileage"
            value={vehicleData.mileage}
            onChange={handleChange}
            className={inputClass}
            placeholder="5000"
            required
            min="0"
          />
        </div>

        {/* Accessories */}
        <div>
          <label className={labelClass}>Accessories</label>
          <input
            name="accessories"
            value={vehicleData.accessories}
            onChange={handleChange}
            className={inputClass}
            placeholder="Helmet, charger, etc. (Optional)"
          />
        </div>

        {/* Inspection */}
        <div>
          <label className={labelClass}>Inspection <span className="text-red-500">*</span></label>
          <input
            name="inspection"
            value={vehicleData.inspection}
            onChange={handleChange}
            className={inputClass}
            placeholder="Yes / No / Until 2025"
            required
          />
        </div>

        {/* Battery Capacity (kWh) */}
        <div>
          <label className={labelClass}>Battery Capacity (kWh) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="batteryCapacity"
            value={vehicleData.batteryCapacity}
            onChange={handleChange}
            className={inputClass}
            placeholder="50"
            required
            min="0"
          />
        </div>

        {/* Condition */}
        <div>
          <label className={labelClass}>Condition <span className="text-red-500">*</span></label>
          <input
            name="condition"
            value={vehicleData.condition}
            onChange={handleChange}
            className={inputClass}
            placeholder="excellent, good, fair"
            required
          />
        </div>

        {/* Price (VND) */}
        <div className="col-span-2">
          <label className={labelClass}>Price (VND) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="price"
            value={vehicleData.price}
            onChange={handleChange}
            className={inputClass}
            placeholder="50000000"
            required
            min="1"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="col-span-2">
          <label className={labelClass}>Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            value={vehicleData.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="Describe the condition, features, or notes..."
            rows={4}
            required
          ></textarea>
        </div>

        {/* Upload Images */}
        <div className="col-span-2">
          <label className={labelClass}>
            Upload Images <span className="text-red-500">*</span>
          </label>
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