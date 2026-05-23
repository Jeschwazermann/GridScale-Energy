import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProblemBar from "../components/ProblemBar";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import ComparisonPreview from "../components/ComparisonPreview";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <ProblemBar />
      <HowItWorks />
      <Features />
      <ComparisonPreview />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
