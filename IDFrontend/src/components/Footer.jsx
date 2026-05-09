import React, { useEffect, useMemo, useState } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Footer() {
  const [config, setConfig] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    fb: '',
    insta: '',
    linkedIn: '',
    twitter: '',
    youtube: '',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/api/confi/GetConfiList');
        if (response.data.success && response.data.result.length > 0) {
          setConfig(response.data.result[0]);
        }
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
      }
    };
    fetchConfig();
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="bg-gray-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold">{config.name || 'SK Cards'}</h3>
            <p className="mt-4 text-sm text-gray-300">
              Professional printing and advertising services for businesses that want to stand out.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: FaFacebookF, href: config.fb },
                { Icon: FaInstagram, href: config.insta },
                { Icon: FaLinkedinIn, href: config.linkedIn },
                { Icon: FaYoutube, href: config.youtube || config.twitter },
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-200 transition-all duration-300 hover:bg-red-600 hover:text-white"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="transition-all duration-300 hover:text-red-400">Home</Link></li>
              <li><Link to="/products" className="transition-all duration-300 hover:text-red-400">Products</Link></li>
              <li><Link to="/allCategories" className="transition-all duration-300 hover:text-red-400">Categories</Link></li>
              <li><Link to="/contact" className="transition-all duration-300 hover:text-red-400">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Popular Categories</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li><Link to="/products" className="transition-all duration-300 hover:text-red-400">Visiting Cards</Link></li>
              <li><Link to="/products" className="transition-all duration-300 hover:text-red-400">Flex & Banners</Link></li>
              <li><Link to="/products" className="transition-all duration-300 hover:text-red-400">Brochures</Link></li>
              <li><Link to="/products" className="transition-all duration-300 hover:text-red-400">Packaging Prints</Link></li>
            </ul>
          </div>

          <address className="not-italic">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <p className="mt-4 text-sm text-gray-300">{config.address || 'Address will appear here.'}</p>
            <p className="mt-2 text-sm text-gray-300">
              Email:{' '}
              <a href={`mailto:${config.email}`} className="transition-all duration-300 hover:text-red-400">
                {config.email || 'N/A'}
              </a>
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Phone:{' '}
              <a href={`tel:${config.phone}`} className="transition-all duration-300 hover:text-red-400">
                {config.phone || 'N/A'}
              </a>
            </p>
          </address>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-5 text-center text-sm text-gray-400">
          © {year} {config.name || 'SK Cards'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
