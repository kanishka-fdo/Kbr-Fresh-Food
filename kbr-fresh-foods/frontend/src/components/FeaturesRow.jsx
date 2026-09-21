import { Package, HandHeart, Leaf, Truck } from 'lucide-react';

export default function FeaturesRow() {
  const features = [
    {
      icon: <Package size={24} strokeWidth={1.5} />,
      title: "Fresh Supply",
      desc: "For Retail & Keells"
    },
    {
      icon: <HandHeart size={24} strokeWidth={1.5} />,
      title: "Secure Payments",
      desc: "Pay easily by Card"
    },
    {
      icon: <Leaf size={24} strokeWidth={1.5} />,
      title: "100% Organic",
      desc: "Direct from farms"
    },
    {
      icon: <Truck size={24} strokeWidth={1.5} />,
      title: "Door Delivery",
      desc: "Negombo & beyond"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 mb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-gray-100">
        {features.map((f, i) => (
          <div key={i} className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="text-brand-500">
              {f.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">{f.title}</h3>
              <p className="text-gray-400 text-xs">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
