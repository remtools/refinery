import { useState } from 'react';
import Button from './Button';

export default function CTASection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Start Saving Time Today
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join 10,000+ professionals who've transformed their productivity. 
          Get started with your 14-day free trial.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <Button type="submit" size="lg" variant="primary" className="bg-white text-blue-600 hover:bg-blue-50">
              Get Started Free
            </Button>
          </div>
        </form>

        <div className="text-blue-100 text-sm space-y-2">
          <div>✓ No credit card required</div>
          <div>✓ Setup in under 15 minutes</div>
          <div>✓ Cancel anytime</div>
        </div>

        <div className="mt-12 pt-8 border-t border-blue-500">
          <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}