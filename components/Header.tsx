import React from 'react';
import { useScrollBehavior } from '../hooks/useScrollBehavior';
import { useMobileMenu } from '../hooks/useMobileMenu';
import { useClickOutside } from '../hooks/useClickOutside';
import { handleNavigation, getNavigationItems } from '../utils/navigation';

const Header: React.FC = () => {
  // Custom hooks for clean separation of concerns
  const { isScrolled, isVisible } = useScrollBehavior();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const mobileMenuRef = useClickOutside<HTMLDivElement>(closeMobileMenu);

  // Get navigation items from utility
  const navigationItems = getNavigationItems();

  // Handle navigation with mobile menu closure
  const onNavClick = (href: string) => {
    handleNavigation(href, closeMobileMenu);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${isScrolled ? 'bg-slate-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <a 
          href="#" 
          className="text-2xl font-bold text-white tracking-wider hover:text-sky-400 transition-colors font-mono z-60"
          onClick={(e) => {
            e.preventDefault();
            onNavClick('#hero');
          }}
        >
          &gt; DevFolio<span className="animate-cursor-blink">_</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a 
                  href={item.href}
                  className="text-lg font-medium hover:text-sky-400 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(item.href);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Burger Menu Button */}
        <button
          className="md:hidden z-60 w-8 h-8 flex flex-col justify-center items-center space-y-1 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 rounded"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span 
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}
          />
          <span 
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span 
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}
          />
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          ref={mobileMenuRef}
          className={`md:hidden fixed top-0 right-0 h-screen w-64 bg-slate-900/95 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="pt-20 px-6">
            <nav>
              <ul className="space-y-6">
                <li>
                  <a 
                    href="#hero" 
                    className="block text-xl font-medium text-white hover:text-sky-400 transition-colors py-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavClick('#hero');
                    }}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#projects" 
                    className="block text-xl font-medium text-white hover:text-sky-400 transition-colors py-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavClick('#projects');
                    }}
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="block text-xl font-medium text-white hover:text-sky-400 transition-colors py-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavClick('#contact');
                    }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeMobileMenu}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
