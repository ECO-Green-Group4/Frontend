import React from "react";
import Header from "../components/ui/Header";

// Định nghĩa cấu trúc dữ liệu cho mỗi gói thành viên
interface MembershipPlan {
  name: string;
  price: string;
  color: "cyan" | "fuchsia" | "pink";
  features: {
    description: string;
    included: boolean;
  }[];
}

// Dữ liệu gói
const plans: MembershipPlan[] = [
  {
    name: "Basic",
    price: "39K",
    color: "cyan",
    features: [
      { description: "Monthly Package", included: true },
      { description: "VIP Gold Post [visible for 7 days]", included: false },
      { description: "VIP Silver Post [visible for 7 days]", included: false },
      { description: "15 Regular Posts [visible for 10 days]", included: true },
      { description: "15 Boosts for Regular Posts Features", included: true },
      { description: "Image copyright protection", included: false },
      { description: "Scheduled posting", included: false },
      { description: "Performance report", included: false },
    ],
  },
  {
    name: "Standard",
    price: "99K",
    color: "fuchsia",
    features: [
      { description: "Monthly Package", included: true },
      { description: "1 VIP Gold Post [visible for 7 days]", included: false },
      { description: "1 VIP Silver Post [visible for 7 days]", included: true },
      { description: "30 Regular Posts [visible for 10 days]", included: true },
      { description: "30 Boosts for Regular Posts Features", included: true },
      { description: "Image copyright protection", included: true },
      { description: "Scheduled posting", included: false },
      { description: "Performance report", included: false },
    ],
  },
  {
    name: "Premium",
    price: "199K",
    color: "pink",
    features: [
      { description: "Monthly Package", included: true },
      { description: "1 VIP Gold Post [visible for 7 days]", included: true },
      { description: "2 VIP Silver Posts [visible for 7 days]", included: true },
      { description: "50 Regular Posts [visible for 10 days]", included: true },
      { description: "50 Boosts for Regular Posts Features", included: true },
      { description: "Image copyright protection", included: true },
      { description: "Scheduled posting", included: true },
      { description: "Performance report", included: true },
    ],
  },
];

// Hàm màu sắc
const getColorClasses = (color: "cyan" | "fuchsia" | "pink") => {
  switch (color) {
    case "cyan":
      return { bg: "bg-cyan-500", text: "text-cyan-600" };
    case "fuchsia":
      return { bg: "bg-fuchsia-500", text: "text-fuchsia-600" };
    default:
      return { bg: "bg-pink-500", text: "text-pink-600" };
  }
};

// Thẻ PlanCard
const PlanCard: React.FC<{ plan: MembershipPlan }> = ({ plan }) => {
  const classes = getColorClasses(plan.color);
  const bgColorClass = classes.bg;
  const btnColorClass = `bg-white hover:bg-gray-100 ${classes.text}`;
  const accentTextColorClass = classes.text;

  return (
    <div
      className={`relative p-0 pt-0 shadow-2xl rounded-3xl transition-all duration-300 transform hover:scale-[1.03] ${bgColorClass} flex flex-col h-full`} // ✅ thêm flex + flex-col + h-full
      style={{ boxShadow: `0 20px 50px -12px rgba(0, 0, 0, 0.4)` }}
    >
      {/* Phần đầu */}
      <div className="p-6 pb-10 bg-white rounded-t-3xl text-center relative">
        <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-3 flex items-center justify-center border-4 border-white shadow-inner">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <h3
          className={`text-xl font-bold bg-white inline-block px-4 py-1 rounded-full absolute bottom-[-1rem] left-1/2 transform -translate-x-1/2 shadow-lg ${accentTextColorClass}`}
        >
          {plan.name}
        </h3>
      </div>

      {/* Nội dung */}
      <div className="pt-10 pb-6 text-white text-center px-6 flex-grow"> {/* ✅ flex-grow để giãn ra */}
        <p className="text-sm font-medium opacity-80 mb-1">Price:</p>
        <p className="text-5xl font-extrabold mb-6">{plan.price}</p>

        <ul className="text-left space-y-2 mt-4 text-sm font-medium">
          {plan.features
            .filter((feature) => feature.included)
            .map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-xl mr-2 font-bold text-white">✓</span>
                <span className="text-white font-semibold">
                  {feature.description}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Nút */}
      <div className="p-6 pt-0 text-center mt-auto"> {/* ✅ mt-auto để nút dính xuống đáy */}
        <button
          onClick={() => alert(`Purchasing ${plan.name} plan...`)}
          className={`w-full py-3 rounded-full text-lg font-bold shadow-xl transition transform hover:scale-[1.05] ${btnColorClass}`}
        >
          Purchase
        </button>
      </div>
    </div>
  );
};

// ✅ Trang Membership có Header + layout gọn
const Membership: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 sm:p-10">
        <div className="text-center mb-12">
          <h1 className="inline-block text-3xl font-extrabold text-white py-2 px-6 rounded-full bg-green-500 shadow-xl border-4 border-white/50">
            Membership
          </h1>
        </div>

        {/* Các gói nằm ngang giữa màn hình */}
        <div className="flex flex-wrap justify-center items-stretch gap-10">
          {plans.map((plan) => (
            <div key={plan.name} className="w-[320px] flex">
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Membership;
