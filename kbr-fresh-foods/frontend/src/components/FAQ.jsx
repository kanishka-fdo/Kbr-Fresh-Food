import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    title: 'How long does delivery take?',
    body: 'Most orders within Negombo are delivered within 2-4 hours. You can track your delivery driver live on the map once your order is out for delivery.',
  },
  {
    title: 'Are your products really organic?',
    body: 'Yes, we partner exclusively with certified organic farms in the Negombo region. We regularly inspect farms to ensure zero synthetic pesticides or fertilizers are used.',
  },
  {
    title: 'Do you offer wholesale pricing?',
    body: 'Yes! Supermarkets, restaurants, and hotels can register for a Business Account to access dedicated wholesale pricing and bulk order quotes.',
  },
  {
    title: 'What if I am not satisfied with the quality?',
    body: 'We have a 100% freshness guarantee. If any item does not meet your expectations, let us know within 24 hours for a full refund or replacement.',
  },
  {
    title: 'Can I pay with cash on delivery?',
    body: 'Yes, we accept Cash on Delivery (COD) as well as secure online card payments and QR code payments upon delivery.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="max-w-3xl mx-auto my-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-500">Everything you need to know about KBR Fresh Foods.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((item, idx) => (
          <div 
            key={item.title} 
            className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
              open === idx ? 'border-brand-300 bg-white shadow-soft' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <button
              onClick={() => setOpen(open === idx ? -1 : idx)}
              className="w-full flex items-center justify-between text-left p-5"
            >
              <span className={`font-semibold ${open === idx ? 'text-brand-700' : 'text-gray-800'}`}>
                {item.title}
              </span>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                open === idx ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {open === idx ? <Minus size={16} /> : <Plus size={16} />}
              </div>
            </button>
            <div 
              className={`px-5 transition-all duration-300 ease-in-out ${
                open === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <p className="text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
