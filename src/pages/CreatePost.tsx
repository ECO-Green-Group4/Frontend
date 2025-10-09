import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleForm from "./VehicleForm";
import BatteryForm from "./BatteryForm";
import Header from "../components/ui/Header"; 

export default function CreatePost() {
  const [category, setCategory] = useState<"EV" | "Battery">("EV");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);

    const payload = {
      category,
      ...data,
    };

    try {
      console.log("🚀 Submitting post:", payload);
      alert("✅ Post submitted successfully!");
      // Redirect to waiting page after successful submission
      navigate("/waiting");
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong, please try again!");
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
