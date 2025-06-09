
import { Metadata } from "next";
import Hero from "@/components/Hero";

import Feature from "@/components/Features";
import About from "@/components/About";
import FeaturesTab from "@/components/FeaturesTab";
import FunFact from "@/components/FunFact";

import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";


export const metadata: Metadata = {
  title: "ООО СТ - ЗЕРНО-БОБОВАЯ КОМПАНИЯ",

  // other metadata

};

export default function Home() {
  return (
    <main>
      <Hero />
      <Feature />
      <About />
      <FeaturesTab />
      <FunFact />
      <CTA />
      <FAQ />
     
      <Pricing />
      <Contact />
      <Footer />
    </main>
  );
}
