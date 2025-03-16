import React, { useState } from 'react';
import { Wifi, Shield, Zap, Settings, Sparkles, Cloud, Lock, ArrowRight } from 'lucide-react';
import LoginForm from './LoginForm';

const ProductSection: React.FC = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="hero-pattern min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Smart Living Made Simple</span>
            </div>
            
            <h1 className="text-7xl font-bold leading-tight mb-8">
              Control Your Home
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-4">
                With a Touch
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-12">
              Experience the future of home automation with our intelligent ESP-based smart switch system. Transform your living space into a modern, connected environment.
            </p>
            
            <div className="flex gap-6 justify-center">
              <button 
                onClick={() => setShowLoginForm(true)}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-3"
              >
                Get Started
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button 
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-bold mb-6">Intelligent Features</h2>
            <p className="text-xl text-gray-600">
              Discover how our smart switch revolutionizes your daily routine with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wifi,
                title: 'Seamless Connectivity',
                desc: 'Control your devices from anywhere with reliable WiFi connection'
              },
              {
                icon: Shield,
                title: 'Advanced Security',
                desc: 'Bank-grade encryption ensures your smart home stays protected'
              },
              {
                icon: Zap,
                title: 'Real-time Control',
                desc: 'Experience instant response with minimal latency'
              },
              {
                icon: Cloud,
                title: 'Cloud Integration',
                desc: 'Sync your preferences across all your devices seamlessly'
              },
              {
                icon: Lock,
                title: 'Access Control',
                desc: 'Manage who can control your devices with detailed permissions'
              },
              {
                icon: Settings,
                title: 'Smart Automation',
                desc: 'Create custom routines and schedules for your devices'
              }
            ].map((feature, index) => (
              <div key={index} className="gradient-border">
                <div className="p-8 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Showcase */}
      <div id="specs" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0 space-y-8">
              <h2 className="text-5xl font-bold leading-tight">
                Engineered for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Excellence
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Every component is carefully selected and tested to ensure reliability and performance.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: 'Powerful Processing',
                    desc: 'ESP32 dual-core processor running at 240MHz'
                  },
                  {
                    title: 'Reliable Memory',
                    desc: '520KB SRAM with 4MB Flash storage capacity'
                  },
                 
                  {
                    title: 'Energy Efficient',
                    desc: 'Advanced power management system'
                  }
                ].map((spec, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{spec.title}</h3>
                      <p className="text-gray-600">{spec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2.5rem] blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1557264322-b44d383a2906?auto=format&fit=crop&q=80&w=1200"
                alt="Product Details"
                className="relative rounded-[2.5rem] shadow-2xl card-shadow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="gradient-border">
              <div className="p-12 space-y-8">
                <h2 className="text-4xl font-bold">Ready to Transform Your Home?</h2>
                <p className="text-xl text-gray-600">
                  Join thousands of smart homeowners who have already upgraded their living spaces
                </p>
                
                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] rounded-2xl">
                  <div className="bg-white px-8 py-6 rounded-2xl">
                    <div className="text-5xl font-bold gradient-text mb-2">₹699</div>
                    <div className="text-gray-600">One-time purchase</div>
                  </div>
                </div>
                
                <div>
                  <button className="group px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-3 mx-auto">
                    Order Now
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
                
                <div className="flex justify-center gap-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span>Free Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoginForm && (
        <LoginForm 
          onLogin={(email, password) => {
            // Handle login logic
          }} 
          onClose={() => setShowLoginForm(false)} 
        />
      )}
    </div>
  );
};

export default ProductSection;