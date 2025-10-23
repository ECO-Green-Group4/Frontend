import React from "react";
import Header from "../components/ui/Header";
import { showToast } from "@/utils/toast";

// Defines the data structure for each membership plan
interface MembershipPlan {
  name:string;
  price:string;
  color: "cyan" | "fuchsia" | "pink";
  features: {
    description:string;
    included:boolean;
  }[];
}

// Plan data, now in English
const plans: MembershipPlan[] = [
  {
    name: "Standard",
    price: "39K",
    color: "cyan",
    features: [
      { description: "'Trusted Seller' Badge", included: true },
      { description: "Up to 5 photos per listing", included: true },
      { description: "Highlighted with a Blue Border", included: true },
      { description: "Post in the 'Standard' section", included: false },
      { description: "Upload video showcase", included: false },
      { description: "Add 'Urgent' tag to listings", included: false },
    ],
  },
  {
    name: "Premium",
    price: "79K",
    color: "fuchsia",
    features: [
      { description: "'Top Seller' Badge", included: true },
      { description: "Up to 15 photos per listing", included: true },
      { description: "Highlighted with a Gold Border", included: true },
      { description: "Post in the 'Standard' section", included: true },
      { description: "Upload video showcase", included: true },
      { description: "Add 'Urgent' & 'Best Deal' tags", included: true },
    ],
  },
  {
    name: "VIP",
    price: "149K",
    color: "pink",
    features: [
      { description: "Prestigious 'Pro Seller' Badge", included: true },
      { description: "Unlimited photos and videos", included: true },
      { description: "Special glow effect on listing", included: true },
      { description: "Post in the homepage 'VIP' section", included: true },
      { description: "Upload video showcase", included: true },
      { description: "Access to all listing tags", included: true },
    ],
  },
];

// Color function (no changes needed)
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

// PlanCard Component
const PlanCard: React.FC<{ plan: MembershipPlan }> = ({ plan }) => {
  const classes = getColorClasses(plan.color);
  const bgColorClass = classes.bg;
  const btnColorClass = `bg-white hover:bg-gray-100 ${classes.text}`;
  const accentTextColorClass = classes.text;

  return (
    <div
      className={`relative p-0 pt-0 shadow-2xl rounded-3xl transition-all duration-300 transform hover:scale-[1.03] ${bgColorClass} flex flex-col h-full`}
      style={{ boxShadow: `0 20px 50px -12px rgba(0, 0, 0, 0.4)` }}
    >
      {/* Top Section */}
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

      {/* Content */}
      <div className="pt-10 pb-6 text-white text-center px-6 flex-grow">
        <p className="text-sm font-medium opacity-80 mb-1">Price per month:</p>
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

      {/* Button */}
      <div className="p-6 pt-0 text-center mt-auto">
        <button
          onClick={() => showToast.success(`You have selected the ${plan.name} plan!`)}
          className={`w-full py-3 rounded-full text-lg font-bold shadow-xl transition transform hover:scale-[1.05] ${btnColorClass}`}
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
};

// Membership Page Component
const Membership: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 sm:p-10">
        <div className="text-center mb-12">
          <h1 className="inline-block text-3xl font-extrabold text-white py-2 px-6 rounded-full bg-green-500 shadow-xl border-4 border-white/50">
            Membership Plans
          </h1>
        </div>

        {/* Plan Cards Grid */}
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