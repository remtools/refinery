export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Connect Your Tools',
      description: 'Integrate with your existing apps and services in minutes. We support 50+ popular tools.',
      icon: '🔗'
    },
    {
      number: '2',
      title: 'Define Workflows',
      description: 'Create custom automation rules or use our pre-built templates for common tasks.',
      icon: '⚙️'
    },
    {
      number: '3',
      title: 'Watch the Magic',
      description: 'Sit back as our AI optimizes your processes and handles repetitive tasks automatically.',
      icon: '✨'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No technical expertise required. Set up your automated workflows in under 15 minutes.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-blue-200 transform -translate-y-1/2"></div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto border-4 border-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Transform Your Workflow?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of professionals who've already saved countless hours with our intelligent automation platform.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>14-day free trial, no credit card required</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Cancel anytime with one click</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg h-48 flex items-center justify-center">
              <p className="text-gray-600">Setup Preview</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}