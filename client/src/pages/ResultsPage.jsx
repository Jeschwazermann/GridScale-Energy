import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { trackEvent } from "../lib/analytics";
import ResultCard from "../components/ResultCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Scroll to top immediately on load — prevents scroll position carrying over from /calculator
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // If someone lands here directly with no data, send them to the form
  useEffect(() => {
    if (!state?.result) {
      navigate("/calculator", { replace: true });
    }
  }, [state, navigate]);

  // Fire the funnel event once we've confirmed there's a real result to show
  useEffect(() => {
    if (state?.result) {
      trackEvent("calculator_completed", {
        savings_per_year: state.result?.comparison?.savingsPerYear ?? null,
        cheapest_source: state.result?.comparison?.cheapestSource ?? null,
      });
    }
  }, [state]);

  if (!state?.result) return null;

  const { result, lifespan, formValues } = state;

  const handleEditInputs = () => {
    navigate("/calculator", {
      state: { formValues },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-teal-700 pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleEditInputs}
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Edit Inputs
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl font-bold text-white mb-2">
                Your Results
              </h1>
              <p className="text-teal-200">
                Here's what your energy costs look like — and what switching to
                solar means for you.
              </p>
            </div>
            <button
              onClick={handleEditInputs}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              <RefreshCw size={14} />
              Recalculate
            </button>
          </div>
        </div>
      </div>

      {/* Results content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <ResultCard
          result={result}
          lifespan={lifespan}
          calculatorInputs={formValues ?? undefined}
          onAdjustInputs={handleEditInputs}
        />

        {/* Bottom edit nudge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-3">
            Want to try different inputs?
          </p>
          <button
            onClick={handleEditInputs}
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-teal-400 text-gray-600 hover:text-teal-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Calculator
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
