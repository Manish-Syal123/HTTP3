"use client";
import DeveloperTools from "@/components/DeveloperTools";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code,
  Globe,
  Zap,
  Menu,
  Shield,
  BarChart,
  Coins,
  Network,
  Search,
  Cpu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const features = [
    {
      icon: Globe,
      title: "Decentralize Deployment",
      description:
        "Deploy and access your website forever for free on the blockchain.",
    },
    {
      icon: Zap,
      title: "Instant Preview & CI/CD",
      description:
        "Automatic deployments from GitHub with instant preview links and version control.",
    },
    {
      icon: Cpu,
      title: "AI Website Generator",
      description:
        "Generate a website using AI and deploy it directly to the blockchain.",
    },
    {
      icon: Search,
      title: "Decentralized Search Engine",
      description:
        "Our search engine has indexed all websites on the blockchain network.",
    },
    {
      icon: BarChart,
      title: "Analytics & Monitoring",
      description:
        "Real-time analytics dashboard and uptime monitoring for your decentralized websites.",
    },
    {
      icon: Network,
      title: "Decentralized CDN",
      description:
        "Utilize our decentralized content delivery network for faster and more reliable access.",
    },
  ];

  useEffect(() => {
    const spotlight = document.getElementById("spotlight");

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      if (spotlight) {
        // spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(203, 199, 199, 0.2) 0%, transparent 40%)`;
        // spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(103, 103, 103, 0.2) 0%, rgba(103, 103, 103, 0.2) 2%, transparent 45%)`;
        spotlight.style.background = `radial-gradient(80rem circle at ${x}px ${y}px, rgba(255,255,255,.09), transparent 40%)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <ThemeProvider attribute={"class"} defaultTheme="dark" enableSystem>
      <div id="spotlight" className="fixed inset-0 pointer-events-none"></div>
      <div className=" h-[170vh] absolute top-0 left-0 right-0 bottom-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          // width="1920"
          // height="1438"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="relative  top-24  w-[45%] left-9">
        <header className="text-start absolute z-10 px-4">
          {/* <Image
            className="mx-auto text-white mb-4"
            src="/svg/logo.svg"
            alt="http3 logo"
            width={70}
            height={40}
            priority
          /> */}
          <h1 className="lg:text-6xl text-4xl font-bold mb-4 flex flex-col items-start justify-start">
            The Future of Web3 Hosting on Smart Contracts
            {/* <span className="text-primary">Smart Contracts</span> */}
          </h1>
          <p className="lg:text-xl text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
            Host your legacy websites like calculators and unit converters on
            the blockchain, absolutely free! No hosting fees, no expiration
            dates. Preserve your simple web projects forever with HTTP3's
            decentralized hosting.
          </p>
          <Link href={"/dashboard"}>
            <Button size="lg" className="mr-4 rounded-full">
              Deploy for Free Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </header>
      </div>
      {/* Features */}
      <div className="p-8 mt-[167vh] pb-20 gap-16 sm:p-12 font-[family-name:var(--font-geist-sans)] text-foreground">
        <main className="max-w-6xl mx-auto">
          <section className="mb-16 text-center">
            <h2 className="text-3xl font-semibold mb-8">
              Revolutionary Web3 Hosting Platform
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0a] border border-1 p-6 rounded-xl transition-opacity duration-300 hover:opacity-80 hover:shadow-lg"
                >
                  <feature.icon className="w-12 h-12 text-primary mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <DeveloperTools />
        {/*  */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HTTP3. All rights reserved.</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
