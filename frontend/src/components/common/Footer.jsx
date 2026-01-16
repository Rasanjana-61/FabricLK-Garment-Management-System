import React from "react";
import  logo  from "../../assets/logo.png";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Wave divider at top */}
      <div className="w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-12 md:h-24" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-white"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-6 py-12">
        {/* Top Section with Logo, Links, and Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <div>
            <img src={logo} alt="Logo" className="h-10 mb-6" />
            <p className="text-gray-600 mb-6 text-sm">
              Your trusted partner in garment manufacturing with over 20 years of experience delivering premium quality products for businesses worldwide.
            </p>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ y: -5, scale: 1.1 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all"
              >
                <FaFacebook size={18} />
              </motion.a>
              <motion.a
                whileHover={{ y: -5, scale: 1.1 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-all"
              >
                <FaTwitter size={18} />
              </motion.a>
              <motion.a
                whileHover={{ y: -5, scale: 1.1 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-2 rounded-full hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all"
              >
                <FaInstagram size={18} />
              </motion.a>
              <motion.a
                whileHover={{ y: -5, scale: 1.1 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-all"
              >
                <FaLinkedin size={18} />
              </motion.a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4 text-lg">Quick Links</h3>
            <div className="h-1 w-10 bg-blue-600 mb-6"></div>
            <ul className="space-y-3">
              <li>
                <a href="/Home" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Products
                </a>
              </li>
              <li>
                <a href="/appointments" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4 text-lg">Contact Information</h3>
            <div className="h-1 w-10 bg-blue-600 mb-6"></div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                <span className="text-gray-600">123 Garment Street, Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-blue-600 mr-3" />
                <a href="tel:+94123456789" className="text-gray-600 hover:text-blue-600 transition-colors">
                  +94 123 456 789
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-blue-600 mr-3" />
                <a href="mailto:info@garmentfactory.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                  info@garmentfactory.com
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4 text-lg">Newsletter</h3>
            <div className="h-1 w-10 bg-blue-600 mb-6"></div>
            <p className="text-gray-600 mb-4 text-sm">
              Subscribe to receive updates on new products, special offers, and industry news.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section with Copyright and Policy Links */}
        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} Garment Factory Management System. All rights reserved.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <a href="/privacy" className="text-gray-500 text-sm hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-500 text-sm hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <a href="/cookies" className="text-gray-500 text-sm hover:text-blue-600 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;