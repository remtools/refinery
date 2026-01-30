import Button from './Button';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Automate Your Workflow,
            <span className="text-blue-600 block">Boost Your Results</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Save 10+ hours every week with intelligent task management and workflow automation. 
            Focus on what matters most while we handle the rest.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="primary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="secondary">
              Watch 2-Min Demo
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            ✓ No credit card required ✓ 14-day free trial ✓ Cancel anytime
          </div>
        </div>
        
        <div className="mt-16 bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-600 text-lg">Dashboard Preview</p>
          </div>
        </div>
      </div>
    </section>
  );
}