import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, footer = true }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      {footer && <Footer />}
    </div>
  );
}
