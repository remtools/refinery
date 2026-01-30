export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600" role="img" aria-label="ProductivityFlow logo">
              ProductivityFlow
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Navigate to features section">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Navigate to how it works section">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Navigate to pricing section">
              Pricing
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Sign in to your account">
              Sign In
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" aria-label="Get started with ProductivityFlow">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}