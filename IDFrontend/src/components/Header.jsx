import React, { useState, useEffect } from "react";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import api from '../api';

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [config, setConfig] = useState({ name: "", logo: "" });

  const navItems = [
    {
      label: "Products",
      submenu: [
        { label: "New Arrivals", path: "/products/new-arrivals" },
        { label: "Best Sellers", path: "/products/best-sellers" },
        { label: "Discounted", path: "/products/discounted" },
      ],
    },
    {
      label: "Services",
      submenu: [
        { label: "Design", path: "/services/design" },
        { label: "Development", path: "/services/development" },
        { label: "Support", path: "/services/support" },
      ],
    },
    {
      label: "About",
      submenu: [
        { label: "Our Story", path: "/about/our-story" },
        { label: "Team", path: "/about/team" },
        { label: "Careers", path: "/about/careers" },
      ],
    },
    {
      label: "Contact",
      submenu: [
        { label: "Email Us", path: "/contact/email" },
        { label: "Location", path: "/contact/location" },
        { label: "Help Center", path: "/contact/help-center" },
      ],
    },
  ];

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get("/api/confi/GetConfiList");
        if (response.data.success && response.data.result.length > 0) {
          setConfig(response.data.result[0]);
        }
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
      }
    };
    fetchConfig();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Checks if click was inside any dropdown container
      if (!e.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
       <div className="flex items-center space-x-2 text-blue-600 text-2xl font-bold">
          <Link to="/" className="flex items-center space-x-2">
           <img
             src={config.logo || "/default-logo.png"}
              alt="Logo"
            className="w-8 h-8 object-contain"
            />
             <span>{config.name || ""}</span>
           </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6" style={{display: 'none'}}>
          {navItems.map((item, index) => (
            <div
              key={index}
              className="relative dropdown-container"
              aria-haspopup="true"
              aria-expanded={openDropdown === index}
            >
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === index ? null : index)
                }
                className="text-gray-700 hover:text-blue-600 font-medium"
                aria-controls={`submenu-${index}`}
                aria-haspopup="true"
                aria-expanded={openDropdown === index}
              >
                {item.label}
              </button>
              {openDropdown === index && (
                <div
                  id={`submenu-${index}`}
                  className="absolute top-full left-0 mt-2 bg-white border rounded-md shadow-lg z-10 w-44"
                  role="menu"
                >
                  {item.submenu.map((subItem, subIdx) => (
                    <Link
                      key={subIdx}
                      to={subItem.path}
                      className="block px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-700"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Search & Icons */}
        <div className="flex items-center space-x-4" style={{ display: "none"}}>
          {/* Search Bar */}
          <div className="relative hidden md:block w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, services..."
              className="border border-gray-300 rounded-full px-5 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Search"
            />
            <FiSearch className="absolute right-4 top-2.5 text-gray-500" />
          </div>

          {/* Cart Icon */}
          <button
            className="relative text-gray-700 hover:text-blue-600 text-xl"
            aria-label="Shopping cart"
          >
            <FiShoppingCart />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
              2
            </span>
          </button>

          {/* Account Icon */}
          <button
            className="text-gray-700 hover:text-blue-600 text-xl"
            aria-label="User account"
          >
            <FiUser />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 shadow-md" role="menu">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Search"
            />
          </div>
          {navItems.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="font-semibold text-gray-800">{item.label}</div>
              <div className="pl-4 text-gray-600 text-sm space-y-1">
                {item.submenu.map((subItem, idx) => (
                  <Link
                    key={idx}
                    to={subItem.path}
                    className="hover:text-blue-600 cursor-pointer block"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
