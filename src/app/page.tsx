import Hero from '../components/Hero';
import About from '../components/About';
import Vision from '../components/Vision';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <About />
      <Vision />
      <Newsletter />
      <Footer />
    </main>
  );
} 