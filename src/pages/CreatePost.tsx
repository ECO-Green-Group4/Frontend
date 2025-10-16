import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleForm from "./VehicleForm";
import BatteryForm from "./BatteryForm";
import Header from "../components/ui/Header"; 
import api from "../services/axios";
import { mapFilesToMockUrls } from "../utils/imageUpload";

export default function CreatePost() {
  const [category, setCategory] = useState<"EV" | "Battery">("EV");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  type BatteryFormData = any;
  type VehicleFormData = any; 

  const toBatteryPayload = (data: BatteryFormData) => ({
    title: data.title,
    description: data.description,
    images: mapFilesToMockUrls(data.images, "battery-image"),
    location: data.location,
    price: Number.parseInt(data.price) || 0,
    brand: data.brand,
    model: data.model,
    year: Number.parseInt(data.year) || 0,
    batteryBrand: data.batteryBrand,
    voltage: data.voltage,
    capacity: data.capacity,
    healthPercent: Number.parseInt(data.healthPercent) || 0,
    chargeCycles: Number.parseInt(data.chargeCycles) || 0,
    type: data.type,
    manufactureYear: Number.parseInt(data.manufactureYear) || 0,
    origin: data.origin,
    postType: data.postType || "For Sale",
  });

  const toVehiclePayload = (data: VehicleFormData) => ({
    title: data.title,
    description: data.description,
    images: mapFilesToMockUrls(data.images, "vehicle-image"),
    location: data.location,
    price: data.price,
    brand: data.brand,
    model: data.model,
    year: data.year,
    bodyType: data.bodyType,
    color: data.color,
    mileage: data.mileage,
    inspection: data.inspection,
    origin: data.origin,
    numberOfSeats: data.numberOfSeats,
    licensePlate: data.licensePlate,
    accessories: data.accessories,
    batteryCapacity: data.batteryCapacity,
    condition: data.condition,
    postType: data.postType || "For Sale",
  });

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      if (category === "Battery") {
        const payload = toBatteryPayload(data);
        const res = await api.post("/seller/listings/battery", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Battery listing created:", res.data);
        alert("🎉 Battery post created successfully!");
      } else {
        const payload = toVehiclePayload(data);
        const res = await api.post("/seller/listings/vehicle", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Vehicle listing created:", res.data);
        alert("🎉 Vehicle post created successfully!");
      }

      navigate("/waiting");
    } catch (err: any) {
      console.error("Create listing error:", err);
      const message = err?.response?.data?.message || err?.message || "Request failed";
      alert(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/*  chỗ này để header hiển thị  */}
      <Header />

      <div className="p-6 bg-white rounded-xl shadow-md max-w-4xl mx-auto border border-gray-100 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-500">
          {category === "EV" ? "🚗 Create EV Post" : "🔋 Create Battery Post"}
        </h2>

        {/* Select Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "EV" | "Battery")}
          className="border p-2 rounded-lg mb-6 w-full focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="EV">EV – Electric Vehicle</option>
          <option value="Battery">Battery</option>
        </select>

        {/* Form Render */}
        {category === "EV" ? (
          <VehicleForm key="vehicle" onSubmit={handleFormSubmit} />
        ) : (
          <BatteryForm key="battery" onSubmit={handleFormSubmit} />
        )}

        {isSubmitting && (
          <p className="text-center text-gray-500 mt-4 animate-pulse">
            🕓 Submitting...
          </p>
        )}
      </div>
    </div>
  );
}
