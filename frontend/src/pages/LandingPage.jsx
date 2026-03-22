import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Wind, Moon, Sun, Star, Users, Github, Twitter, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = ({ isDarkMode, toggleTheme }) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="smooth-scroll">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-primary-500 w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">SecureChat</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
            <a href="#reviews" className="hover:text-primary-400 transition-colors">Reviews</a>
            <a href="#about" className="hover:text-primary-400 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <Link to="/signin" className="hidden md:block px-4 py-2 text-sm font-medium border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all">Sign In</Link>
            <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Chat <span className="text-primary-500">Privately.</span><br />
            Message <span className="text-blue-500 underline decoration-2 underline-offset-8">Securely.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            A privacy-first chat experience inspired by the best security standards. 
            Enjoy seamless communication with advanced encryption and vanishing messages.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/signup" className="px-8 py-4 bg-primary-600 rounded-xl text-lg font-bold hover:bg-primary-700 transition-all transform hover:scale-105 active:scale-95">Get Started Free</Link>
            <a href="#features" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-lg font-bold hover:bg-white/10 transition-all">Explore Features</a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SecureChat?</h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div {...fadeInUp} className="p-8 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Normal Chat</h3>
              <p className="text-slate-400">High-performance messaging with end-to-end connectivity. Simple, fast, and reliable.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="p-8 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Lock className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">DarkRoom</h3>
              <p className="text-slate-400">Double-PIN encrypted secret chats. Maximum privacy for your most sensitive conversations.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="p-8 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                <Wind className="text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Evaporation</h3>
              <p className="text-slate-400">Self-destructing messages that disappear once read. Leave no digital footprint behind.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Trusted by Thousands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="italic text-slate-300 mb-6">"Finally an app that respects my privacy without being clunky. The DarkRoom feature is genius."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                  <div>
                    <h4 className="font-bold text-sm">User_{i}33</h4>
                    <span className="text-xs text-slate-500">Verified User</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-primary-500 w-6 h-6" />
                <span className="text-xl font-bold">SecureChat</span>
              </div>
              <p className="text-slate-400 max-w-sm">Building the future of private communication. Available worldwide, encrypted by default.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4" /> +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" /> support@securechat.app
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Social</h4>
              <div className="flex gap-4">
                <Twitter className="w-5 h-5 text-slate-400 hover:text-blue-400 cursor-pointer" />
                <Github className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                <Mail className="w-5 h-5 text-slate-400 hover:text-red-400 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center text-xs text-slate-500">
            <p>© 2026 SecureChat Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
