import { ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: '5 Benefits of Organic Green Smoothies',
    excerpt: 'Start your morning right with a nutrient-packed green smoothie. Here is why you should make the switch.',
    date: 'Oct 12, 2023',
    image: '/blog_1.png',
    category: 'Health',
  },
  {
    id: 2,
    title: 'Farm to Table: The KBR Fresh Promise',
    excerpt: 'Take a behind-the-scenes look at how we source our fresh produce from local Negombo farmers.',
    date: 'Oct 05, 2023',
    image: '/blog_2.png',
    category: 'Community',
  },
  {
    id: 3,
    title: 'Seasonal Vegetables You Should Try This Month',
    excerpt: 'Embrace the season with these fresh, organic vegetables that are currently at their peak flavor.',
    date: 'Sep 28, 2023',
    image: '/blog_3.png',
    category: 'Guide',
  },
];

export default function BlogPreview() {
  return (
    <div className="mb-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Fresh Blog Updates</h2>
          <p className="text-gray-500">Tips, recipes, and news from our organic community</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <div key={post.id} className="group cursor-pointer">
            <div className="relative rounded-3xl overflow-hidden mb-5 aspect-[4/3]">
              <img 
                src={post.image} 
                alt={post.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {post.category}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-2">{post.date}</p>
            <h3 className="text-xl font-display font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-500 mb-4 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-1.5 text-brand-600 font-semibold group-hover:gap-2 transition-all">
              Read Article <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
