import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBase = isLanding
    ? scrolled
      ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
      : "bg-transparent"
    : "bg-white border-b border-gray-100 shadow-sm";

  const textColor = isLanding && !scrolled ? "text-white" : "text-gray-800";
  const linkHover =
    isLanding && !scrolled ? "hover:text-teal-300" : "hover:text-teal-600";
  const subColor =
    isLanding && !scrolled
      ? "text-teal-300/80 hover:text-teal-200"
      : "text-gray-500 hover:text-teal-600";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBase}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <Sun size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span
            className={`font-display font-bold text-xl tracking-tight transition-colors ${textColor}`}
          >
            GridScale Africa
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {isLanding && (
            <>
              <a
                href="#how-it-works"
                className={`text-sm font-medium transition-colors ${textColor} ${linkHover}`}
              >
                How It Works
              </a>
              <a
                href="#features"
                className={`text-sm font-medium transition-colors ${textColor} ${linkHover}`}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className={`text-sm font-medium transition-colors ${textColor} ${linkHover}`}
              >
                Testimonials
              </a>
            </>
          )}
          {/* Installer link — subtle, secondary */}
          <Link
            to="/installer/login"
            className={`text-sm font-medium transition-colors ${subColor}`}
          >
            Installer Login
          </Link>
          <Link
            to="/calculator"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
          >
            Launch Calculator
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden transition-colors ${textColor}`}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
          {isLanding && (
            <>
              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-teal-600"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-teal-600"
              >
                Features
              </a>
              <a
                href="#testimonials"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-teal-600"
              >
                Testimonials
              </a>
            </>
          )}
          {/* Installer links in mobile menu */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <Link
              to="/installer/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-500 hover:text-teal-600"
            >
              Installer Login
            </Link>
            <Link
              to="/installer/signup"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Join as Installer →
            </Link>
          </div>
          <Link
            to="/calculator"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center bg-teal-600 text-white text-sm font-semibold px-5 py-3 rounded-lg"
          >
            Launch Calculator
          </Link>
        </div>
      )}
    </header>
  );
}
