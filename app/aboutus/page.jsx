import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About Us | Newwss.com</title>
        <meta
          name="description"
          content="Newwss.com – real-time Indian news covering finance, markets, and tech. Fast, factual, and fearless reporting you can trust."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#111829] text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="relative px-4 py-20 max-w-6xl mx-auto text-center h-screen">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Live News Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-fade-in">
              About Newwss
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Delivering <span className="text-yellow-300 font-bold">real-time</span>, 
              <span className="text-green-300 font-bold"> factual</span>, and 
              <span className="text-pink-300 font-bold"> fearless</span> journalism 
              that empowers your decisions
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {['📈 Business', '💰 Finance', '🚀 Tech'].map((item, index) => (
                <div key={index} className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-16 max-w-6xl mx-auto">
          {/* Mission & Vision Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="group">
              <div className="h-full p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Empower readers with timely and accurate news that drives awareness, 
                  informed decisions, and positive impact across business and technology sectors.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="h-full p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🧠</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Cover</h2>
                <div className="space-y-3">
                  {[
                    "Business & Economy",
                    "Stock Market & Finance", 
                    "Startups & Technology",
                    "Policy & Politics",
                    "Global Affairs",
                    "IPO & Market Trends"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mb-16">
            <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border-2 border-green-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">✅</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Why Trust Us</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: "🔍", text: "Fact-checked, editor-reviewed content" },
                  { icon: "📱", text: "Mobile-optimized, ad-light reading experience" },
                  { icon: "⚡", text: "Modern tech stack (Next.js, Node.js, MongoDB)" },
                  { icon: "🌐", text: "Real-time updates with credible sources" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <span className="text-2xl mr-4">{item.icon}</span>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="grid md:grid-cols-2 gap-8 ">
            <div className="animate-pulse">
              <div className="h-full p-8 bg-[#111829] from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🤝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Contact & Collaborate</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <span className="text-lg mr-3">📧</span>
                    <a
                      href="mailto:informativejournall@gmail.com"
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      informativejournall@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <span className="text-lg mr-3">📞</span>
                    <a
                      href="tel:+919566865145"
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      +91 ***** *****
                    </a>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <span className="text-lg mr-3">💼</span>
                    <a
                      href="https://www.linkedin.com/company/newwss/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Newwss on LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="h-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📲</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Follow Us</h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: "🐦", platform: "Twitter (X)", handle: "@newwss", url: "https://x.com/newwss" },
                    { icon: "📸", platform: "Instagram", handle: "@newwss", url: "https://instagram.com/newwss" },
                    { icon: "📺", platform: "YouTube", handle: "@newwss", url: "https://youtube.com/@newwss" }
                  ].map((social, index) => (
                    <div key={index} className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                      <span className="text-lg mr-3">{social.icon}</span>
                      <div>
                        <div className="text-sm text-gray-500">{social.platform}</div>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {social.handle}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}