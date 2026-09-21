import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Hero from '../../components/Hero';
import FeaturesRow from '../../components/FeaturesRow';
import CategoryShowcase from '../../components/CategoryShowcase';
import PromoBanners from '../../components/PromoBanners';
import FeaturedProducts from '../../components/FeaturedProducts';
import FruitSaladPromo from '../../components/FruitSaladPromo';
import TrendyProducts from '../../components/TrendyProducts';
import FAQ from '../../components/FAQ';
import BlogPreview from '../../components/BlogPreview';
import NewsletterBanner from '../../components/NewsletterBanner';
import VideoAdBanner from '../../components/VideoAdBanner';
import PromoVideoSection from '../../components/PromoVideoSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import HowItWorksSection from '../../components/HowItWorksSection';
import CinematicVideoSection from '../../components/CinematicVideoSection';
import { productApi, categoryApi } from '../../api/services';

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      setCategories(res.data.categories || []);
    });

    // Fetch products for the Featured and Trendy sections
    productApi
      .getAll({})
      .then((res) => setProducts(res.data.products || []))
      .finally(() => setLoading(false));
  }, []);

  const goToShop = () => navigate('/products');

  const goToCategory = (catId) => {
    navigate(`/products?category=${catId}`);
  };

  return (
    <Layout>
      {/* ══════════════════════════════════════════════
          CINEMATIC HERO SECTION
      ══════════════════════════════════════════════ */}
      <Hero onShopNow={goToShop} />

      {/* Features strip */}
      <div className="mt-12">
        <FeaturesRow />
      </div>

      {/* Category Showcase */}
      <CategoryShowcase
        categories={categories}
        activeCategory=""
        onSelect={goToCategory}
      />

      {/* VIDEO AD BANNER #1 — Full-width cinematic */}
      <VideoAdBanner />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Featured Products */}
      {!loading && products.length > 0 && <FeaturedProducts products={products} />}

      {/* CINEMATIC VIDEO SECTION — Split layout */}
      <CinematicVideoSection />

      {/* Promo Banners */}
      <PromoBanners />

      {/* PROMO VIDEO SECTION #2 — Split layout */}
      <PromoVideoSection />

      {/* Fruit Salad Promo */}
      <FruitSaladPromo />

      {/* Trendy Products */}
      {!loading && products.length > 0 && <TrendyProducts products={products} />}

      {/* TESTIMONIALS CAROUSEL */}
      <TestimonialsSection />

      {/* Bottom sections */}
      <FAQ />
      <BlogPreview />
      <NewsletterBanner />
    </Layout>
  );
}
