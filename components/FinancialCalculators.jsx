"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import AdBanner from "@/components/BannerAds";
import AdsterraAd from "@/components/AdsterraAds";

export default function FinancialCalculators() {
  const [activeTab, setActiveTab] = useState("sip");
  const calculatorRef = useRef(null);
  const tabsRef = useRef(null);

  // Animation on tab change
  useEffect(() => {
    gsap.from(calculatorRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [activeTab]);

  // Scroll tabs horizontally
  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Common input component with enhanced styling
  const InputField = ({
    label,
    id,
    value,
    onChange,
    prefix = "",
    suffix = "",
    min,
    max,
    step,
  }) => (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          id={id}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`block w-full rounded-lg border-0 py-3 ${
            prefix ? "pl-9" : "pl-4"
          } ${
            suffix ? "pr-9" : "pr-4"
          } text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all duration-200`}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {min !== undefined && max !== undefined && (
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          step={step || 1}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3 accent-blue-600"
        />
      )}
    </div>
  );

  // SIP Calculator
  const SIPCalculator = () => {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [annualReturn, setAnnualReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);
    const [result, setResult] = useState(null);

    const calculateSIP = () => {
      const monthlyRate = annualReturn / 12 / 100;
      const months = timePeriod * 12;
      const futureValue =
        monthlyInvestment *
        (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
          (1 + monthlyRate));
      setResult({
        investedAmount: monthlyInvestment * months,
        estimatedReturns: futureValue - monthlyInvestment * months,
        totalValue: futureValue,
      });
    };

    return (
      <div>
        <InputField
          label="Monthly Investment (₹)"
          id="sip-amount"
          value={monthlyInvestment}
          onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value))}
          prefix="₹"
          min={500}
          max={100000}
          step={500}
        />
        <InputField
          label="Expected Annual Return (%)"
          id="sip-return"
          value={annualReturn}
          onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
          suffix="%"
          min={1}
          max={30}
          step={0.1}
        />
        <InputField
          label="Time Period (Years)"
          id="sip-time"
          value={timePeriod}
          onChange={(e) => setTimePeriod(parseFloat(e.target.value))}
          suffix="years"
          min={1}
          max={40}
        />

        <button
          onClick={calculateSIP}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          Calculate SIP Returns
        </button>

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              SIP Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  Invested Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{result.investedAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  Estimated Returns
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{result.estimatedReturns.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ₹{result.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Lumpsum Calculator
  const LumpsumCalculator = () => {
    const [investment, setInvestment] = useState(100000);
    const [annualReturn, setAnnualReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(5);
    const [result, setResult] = useState(null);

    const calculateLumpsum = () => {
      const futureValue =
        investment * Math.pow(1 + annualReturn / 100, timePeriod);
      setResult({
        investedAmount: investment,
        estimatedReturns: futureValue - investment,
        totalValue: futureValue,
      });
    };

    return (
      <div>
        <InputField
          label="Investment Amount (₹)"
          id="lumpsum-amount"
          value={investment}
          onChange={(e) => setInvestment(parseFloat(e.target.value))}
          prefix="₹"
          min={1000}
          max={10000000}
          step={1000}
        />
        <InputField
          label="Expected Annual Return (%)"
          id="lumpsum-return"
          value={annualReturn}
          onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
          suffix="%"
          min={1}
          max={30}
          step={0.1}
        />
        <InputField
          label="Time Period (Years)"
          id="lumpsum-time"
          value={timePeriod}
          onChange={(e) => setTimePeriod(parseFloat(e.target.value))}
          suffix="years"
          min={1}
          max={40}
        />

        <button
          onClick={calculateLumpsum}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          Calculate Lumpsum Returns
        </button>

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Lumpsum Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  Invested Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{result.investedAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  Estimated Returns
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{result.estimatedReturns.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ₹{result.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // EMI Calculator
  const EMICalculator = () => {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);
    const [result, setResult] = useState(null);

    const calculateEMI = () => {
      const monthlyRate = interestRate / 12 / 100;
      const months = loanTenure * 12;
      const emi =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
      const totalPayment = emi * months;
      const totalInterest = totalPayment - loanAmount;

      setResult({
        emi: emi,
        totalPayment: totalPayment,
        totalInterest: totalInterest,
      });
    };

    return (
      <div>
        <InputField
          label="Loan Amount (₹)"
          id="loan-amount"
          value={loanAmount}
          onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
          prefix="₹"
          min={10000}
          max={100000000}
          step={10000}
        />
        <InputField
          label="Interest Rate (%)"
          id="interest-rate"
          value={interestRate}
          onChange={(e) => setInterestRate(parseFloat(e.target.value))}
          suffix="%"
          min={1}
          max={30}
          step={0.1}
        />
        <InputField
          label="Loan Tenure (Years)"
          id="loan-tenure"
          value={loanTenure}
          onChange={(e) => setLoanTenure(parseFloat(e.target.value))}
          suffix="years"
          min={1}
          max={30}
        />

        <button
          onClick={calculateEMI}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          Calculate EMI
        </button>

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              EMI Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{result.emi.toFixed(0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  Total Interest
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₹{result.totalInterest.toFixed(0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  Total Payment
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ₹{result.totalPayment.toFixed(0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Principal
                </span>
                <span className="text-sm font-medium text-gray-500">
                  Interest
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{
                    width: `${(loanAmount / result.totalPayment) * 100}%`,
                    background:
                      "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">
                  ₹{loanAmount.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  ₹{result.totalInterest.toFixed(0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render active calculator
  const renderCalculator = () => {
    switch (activeTab) {
      case "sip":
        return <SIPCalculator />;
      case "lumpsum":
        return <LumpsumCalculator />;
      case "emi":
        return <EMICalculator />;
      default:
        return <SIPCalculator />;
    }
  };

  const tabs = [
    { id: "sip", label: "SIP Calculator" },
    { id: "lumpsum", label: "Lumpsum Calculator" },
    { id: "emi", label: "EMI Calculator" },
    { id: "compound", label: "Compound Interest" },
    { id: "tax", label: "Income Tax" },
    { id: "retirement", label: "Retirement" },
    { id: "inflation", label: "Inflation" },
    { id: "fdrd", label: "FD/RD Calculator" },
    { id: "creditcard", label: "Credit Card Payoff" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner Ad */}
      <div className="mb-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <AdBanner />
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Ad
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Financial Calculators
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Plan your financial future with our comprehensive suite of calculators, designed to help you make informed decisions.
        </p>
      </div>

      <div className="relative mb-8">
        <button
          onClick={() => scrollTabs("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-50 transition hover:scale-105"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div
          ref={tabsRef}
          className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          <div className="flex space-x-3 px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 snap-start text-sm ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => scrollTabs("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-50 transition hover:scale-105"
        >
          <FiChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Calculator Section */}
        <div className="flex-1">
          <div
            ref={calculatorRef}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            {renderCalculator()}
          </div>
        </div>

        {/* Sidebar Ad */}
        <div className="w-full md:w-80">
          <div className="sticky top-8">
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <AdsterraAd />
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Ad
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div className="mt-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <AdBanner />
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Ad
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}