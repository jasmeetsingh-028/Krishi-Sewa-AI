import Link from "next/link";
import {
  Headset,
  MessageCircle,
  Leaf,
  ShoppingCart,
} from "lucide-react";

export default function Landing() {
  /* feature cards shown under the hero */
  const features = [
    {
      title: "Voice Agent",
      description: "Call the AI agronomist hands-free.",
      href: "/voice-ai",
      icon: Headset,
    },
    {
      title: "Conversational Agent",
      description: "Chat with KrishiSewa in real-time.",
      href: "/conversational-ai",
      icon: MessageCircle,
    },
    {
      title: "Crop Guide",
      description: "Best-practice sheets for 30+ crops.",
      href: "/crop-guide",
      icon: Leaf,
    },
    {
      title: "Market Prices",
      description: "Live mandi prices & trend graphs.",
      href: "/market-prices",
      icon: ShoppingCart,
    },
  ];

  return (
    <div 
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'}} 
      className="min-h-screen bg-gradient-to-b from-background to-background/70"
    >
      <div className="pt-8 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-100 mb-6">
          Welcome to <span className="text-primary-300">KrishiSewa&nbsp;AI</span>
        </h1>
        
        <p className="max-w-xl mx-auto text-light-100/80 mb-8">
          Your one-stop platform for voice-enabled agricultural assistance,
          real-time chat, crop guides and live market prices.
        </p>
      </div>

      {/* ───────────── Feature Grid ───────────── */}
      <section className="flex-1 flex flex-col items-center mt-9 justify-start px-4">
        <div className="w-full max-w-5xl grid gap-8 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {features.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur
                         transition hover:border-primary-300 hover:bg-primary-300/10"
            >
              <Icon className="h-8 w-8 text-primary-300 group-hover:text-primary-200 mb-4" />

              <h2 className="text-lg font-semibold text-primary-100 group-hover:text-primary-100/90">
                {title}
              </h2>
              <p className="text-sm text-light-100/70 mt-1">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
