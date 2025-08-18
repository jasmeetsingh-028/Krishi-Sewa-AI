import React from 'react';
import { Phone, Clock, MapPin, Users, Leaf, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

const page = () => {
  const helplineCategories = [
    {
      title: "Emergency Agriculture Support",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      numbers: [
        { name: "Kisan Call Centre", number: "1800-180-1551", time: "24x7", description: "General agriculture queries and support" },
        { name: "PM-Kisan Helpline", number: "155261", time: "6 AM - 10 PM", description: "PM-Kisan scheme related queries" },
        { name: "Crop Insurance", number: "1800-200-7710", time: "10 AM - 6 PM", description: "PMFBY crop insurance support" },
      ]
    },
    {
      title: "Market & Price Information",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      numbers: [
        { name: "mKisan Portal", number: "1800-180-1551", time: "9 AM - 6 PM", description: "Market prices and trends" },
        { name: "eNAM Support", number: "1800-270-0224", time: "9 AM - 6 PM", description: "National agriculture market" },
        { name: "FPO Helpline", number: "1800-270-0224", time: "Business Hours", description: "Farmer Producer Organizations" },
      ]
    },
    {
      title: "Crop Protection & Disease",
      icon: Shield,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      numbers: [
        { name: "Plant Protection", number: "1800-180-1551", time: "24x7", description: "Pest and disease management" },
        { name: "Seed Certification", number: "1800-180-1551", time: "9 AM - 5 PM", description: "Quality seed related issues" },
        { name: "Fertilizer Quality", number: "1800-180-1551", time: "9 AM - 5 PM", description: "Fertilizer quality complaints" },
      ]
    },
    {
      title: "Weather & Advisory",
      icon: Leaf,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      numbers: [
        { name: "Weather Advisory", number: "1800-180-1551", time: "24x7", description: "Weather forecasts and alerts" },
        { name: "IMD Agro Advisory", number: "1800-843-4567", time: "24x7", description: "Agricultural weather services" },
        { name: "Disaster Management", number: "108", time: "24x7", description: "Natural disaster support" },
      ]
    },
    {
      title: "Financial Services",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      numbers: [
        { name: "KCC Helpline", number: "1800-270-3333", time: "9 AM - 6 PM", description: "Kisan Credit Card support" },
        { name: "Bank Credit Support", number: "1800-425-1415", time: "9 AM - 6 PM", description: "Agricultural loan assistance" },
        { name: "SBI Kisan Portal", number: "1800-425-3800", time: "24x7", description: "SBI agricultural services" },
      ]
    },
    {
      title: "State-wise Support",
      icon: MapPin,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      numbers: [
        { name: "Punjab Agriculture", number: "1800-180-1551", time: "9 AM - 5 PM", description: "Punjab state agriculture dept" },
        { name: "Maharashtra Kisan", number: "1800-233-4555", time: "9 AM - 6 PM", description: "Maharashtra agriculture support" },
        { name: "UP Agriculture", number: "1800-180-1551", time: "9 AM - 5 PM", description: "Uttar Pradesh agriculture dept" },
      ]
    }
  ];

  return (
    <div 
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }} 
      className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Header */}
<div className="text-center py-4 sm:py-6 lg:py-8 mt-12 sm:mt-14 mb-8 sm:mb-12 px-3 sm:px-4 md:px-6 lg:ml-64 xl:ml-72">
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary-100 mb-3 sm:mb-4 lg:mb-6">
    🌾 <span className="text-primary-300">Kisan</span> SOS Hub
  </h1>
  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-light-100/80 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-0 leading-relaxed">
    Your comprehensive directory of essential helpline numbers for farmers across India
  </p>
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-light-100/60">
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Phone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
      <span className="font-medium">24x7 Support Available</span>
    </div>
    <div className="hidden sm:block w-px h-4 bg-light-100/30"></div>
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Shield className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
      <span className="font-medium">Government Verified</span>
    </div>
  </div>
</div>


      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:ml-64 lg:px-8 xl:ml-72 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Helpline Categories Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 mb-6 sm:mb-8">
            {helplineCategories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className={`rounded-xl border ${category.borderColor} ${category.bgColor} p-3 sm:p-4 backdrop-blur transition-all hover:scale-[1.01] sm:hover:scale-[1.02] shadow-lg`}
              >
                {/* Category Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${category.bgColor} border ${category.borderColor}`}>
                    <category.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${category.color}`} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-primary-100 leading-tight">
                    {category.title}
                  </h2>
                </div>

                {/* Helpline Numbers */}
                <div className="space-y-2 sm:space-y-3">
                  {category.numbers.map((helpline, index) => (
                    <div
                      key={index}
                      className="border border-white/10 rounded-lg p-2.5 sm:p-3 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex flex-col gap-1 mb-1.5 sm:mb-2">
                        <h3 className="font-semibold text-primary-100 text-xs sm:text-sm leading-tight">
                          {helpline.name}
                        </h3>
                        <a
                          href={`tel:${helpline.number}`}
                          className={`${category.color} hover:underline font-mono font-bold text-sm sm:text-base transition-colors`}
                        >
                          {helpline.number}
                        </a>
                      </div>
                      
                      <p className="text-xs text-light-100/70 mb-1.5 sm:mb-2 leading-relaxed">
                        {helpline.description}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-light-100/50">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{helpline.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Banner */}
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="text-center">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mx-auto mb-2" />
              <h3 className="text-base sm:text-lg font-bold text-red-400 mb-2">Emergency Support</h3>
              <p className="text-xs sm:text-sm text-light-100/80 mb-3 sm:mb-4 max-w-lg mx-auto leading-relaxed">
                For immediate agricultural emergencies, natural disasters, or urgent crop issues
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                <a
                  href="tel:1800-180-1551"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  1800-180-1551
                </a>
                <a
                  href="tel:108"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  108 (Disaster)
                </a>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pb-4">
            <p className="text-xs sm:text-sm text-light-100/60 max-w-md mx-auto px-2">
              💡 <strong>Tip:</strong> Save these numbers in your phone for quick access during farming emergencies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
