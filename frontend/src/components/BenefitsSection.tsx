export default function BenefitsSection() {
  const benefits = [
    {
      icon: '⚡',
      title: '10x Faster Workflows',
      description: 'Automate repetitive tasks and reduce manual work by up to 90%',
      metric: 'Save 10+ hrs/week'
    },
    {
      icon: '🎯',
      title: 'Smart Prioritization',
      description: 'AI-powered task ranking ensures you focus on high-impact activities',
      metric: '40% more productive'
    },
    {
      icon: '🔄',
      title: 'Seamless Integration',
      description: 'Connect with 50+ tools you already use for unified workflow management',
      metric: '50+ integrations'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track productivity metrics and identify bottlenecks with detailed insights',
      metric: 'Data-driven decisions'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transform Your Productivity
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who've revolutionized their workflow with our intelligent automation platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 hover:bg-blue-50 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {benefit.description}
              </p>
              <div className="text-sm font-medium text-blue-600 bg-blue-100 rounded-full px-3 py-1 inline-block">
                {benefit.metric}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Trusted by 10,000+ Productive Teams
          </h3>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-blue-100">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-blue-100">Retention Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}