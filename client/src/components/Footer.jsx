import { Link } from "react-router-dom";
import { Sun } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Sun size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">
                GridScale Africa
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Helping Nigerians make smarter energy decisions with clear, honest
              cost comparisons.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Product
            </p>
            <ul className="space-y-3">
              {[
                { label: "Calculator", to: "/calculator" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Features", href: "/#features" },
                { label: "Testimonials", href: "/#testimonials" },
              ].map(({ label, to, href }) => (
                <li key={label}>
                  {to ? (
                    <Link
                      to={to}
                      className="text-gray-500 hover:text-teal-400 text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="text-gray-500 hover:text-teal-400 text-sm transition-colors"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Installer links */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
              For Installers
            </p>
            <ul className="space-y-3">
              {[
                { label: "Installer Login", to: "/installer/login" },
                { label: "Join as Installer", to: "/installer/signup" },
                { label: "Installer Dashboard", to: "/installer/dashboard" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-gray-500 hover:text-teal-400 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Disclaimer
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              GridScale Africa provides estimates for informational purposes
              only. Costs vary by location, vendor, and market conditions.
              Always consult a certified solar installer before making
              investment decisions.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} GridScale Africa. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Built with clarity · Powered by data
          </p>
        </div>
      </div>
    </footer>
  );
}
