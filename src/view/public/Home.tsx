import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Menu, X, Phone, Mail, Facebook, Instagram, Youtube,
  ChevronDown, ArrowRight, UserCheck
} from "lucide-react";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMegaMenu(null);
    window.scrollTo(0, 0);
  }, [location]);

  const toggleMenu = () => { setIsMenuOpen(!isMenuOpen); };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  const navItems = [
    {
      title: "Colegio",
      items: [
        { name: "Bienvenida", path: "/bienvenida" },
        { name: "Nuestros Valores", path: "/valores" },
        { name: "Nuestros Pilares", path: "/pilares" },
        { name: "Instalaciones", path: "/espacio" },
        { name: "Historia y Visión", path: "/vision-mision" },
      ]
    },
    {
      title: "Propuesta",
      items: [
        { name: "Nivel Inicial", path: "/inicial" },
        { name: "Excelencia Académica", path: "/excelencia" },
        { name: "Idiomas", path: "/idiomas" },
        { name: "Tecnología e Innovación", path: "/tecnologia" },
        { name: "Deporte", path: "/deporte" },
        { name: "Arte y Cultura", path: "/arte" },
      ]
    },
    {
      title: "Comunidad",
      items: [
        { name: "Nuestra Comunidad", path: "/comunidad" },
      ]
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 flex flex-col overflow-x-hidden relative">

      {/* Top Bar - Minimalist Editorial */}
      <div className="bg-[#0a0a0c] text-white/70 py-2 px-6 hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center text-[10px] font-medium tracking-[0.1em] uppercase">
          <div className="flex gap-8">
            <a href="tel:+51974958865" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={12} className="text-orange-500" /> +51 974 958 865
            </a>
            <a href="mailto:admision@crayons.edu.pe" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={12} className="text-orange-500" /> admision@crayons.edu.pe
            </a>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex gap-4 pr-6 border-r border-white/10">
              <a href="#" aria-label="Facebook" className="hover:text-orange-500 transition-colors"><Facebook size={12} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-orange-500 transition-colors"><Instagram size={12} /></a>
              <a href="#" aria-label="Youtube" className="hover:text-orange-500 transition-colors"><Youtube size={12} /></a>
            </div>
            <Link to="/login" className="flex items-center gap-2 hover:text-white transition-colors">
              <UserCheck size={12} className="text-orange-500" /> Intranet
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] py-1.5"
          : "bg-white py-2 md:py-3"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-10 md:h-12">          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="https://res.cloudinary.com/dszdc6rh8/image/upload/v1747351782/image_1_vhjpzr.png"
              alt="Crayon's Logo"
              className={`transition-all duration-500 object-contain ${scrolled ? "h-7 md:h-8" : "h-8 md:h-10"}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className="relative h-full flex items-center group"
                onMouseEnter={() => setActiveMegaMenu(item.title)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button className="flex items-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-800 hover:text-orange-600 transition-colors">
                  {item.title}
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeMegaMenu === item.title ? "rotate-180 text-orange-600" : "text-slate-400"}`} />
                </button>

                {/* Dropdown Menu - Clean Editorial Style */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ease-out origin-top ${activeMegaMenu === item.title
                    ? "opacity-100 visible scale-100 translate-y-0"
                    : "opacity-0 invisible scale-95 -translate-y-2"
                    }`}
                >
                  <div className="bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 w-[240px] overflow-hidden p-2">
                    <div className="flex flex-col">
                      {item.items.map((subItem, sIdx) => (
                        <Link
                          key={sIdx}
                          to={subItem.path}
                          className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50/50 rounded-xl transition-all flex items-center justify-between group/link"
                        >
                          {subItem.name}
                          <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 ml-4">
              <Link
                to="/contacto"
                className="px-5 py-2 rounded-full text-[11px] font-medium uppercase tracking-widest text-slate-900 border border-slate-200 hover:border-slate-900 transition-colors"
              >
                Contacto
              </Link>
              <Link
                to="/admision"
                className="px-5 py-2 rounded-full text-[11px] font-medium uppercase tracking-widest text-white bg-orange-700 hover:bg-orange-800 shadow-[0_10px_20px_-10px_rgba(194,65,12,0.5)] hover:shadow-[0_10px_20px_-5px_rgba(194,65,12,0.6)] transition-all transform hover:-translate-y-0.5"
              >
                Admisión
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2 text-slate-900 hover:text-orange-600 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={toggleMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-[85%] max-w-[400px] h-[100dvh] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <img
              src="https://res.cloudinary.com/dszdc6rh8/image/upload/f_auto,q_auto/v1747351782/image_1_vhjpzr.png"
              alt="Logo"
              width="122"
              height="32"
              loading="lazy"
              className="h-8 object-contain"
            />
            <button onClick={toggleMenu} className="p-2 -mr-2 text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="space-y-8">
              {navItems.map((item, idx) => (
                <div key={idx} className="space-y-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-500">
                    {item.title}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {item.items.map((subItem, sIdx) => (
                      <Link
                        key={sIdx}
                        to={subItem.path}
                        className="text-base font-medium text-slate-600 hover:text-orange-600 transition-colors"
                        onClick={toggleMenu}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 space-y-4">
            <Link
              to="/login"
              className="flex items-center justify-center w-full py-3 rounded-full text-xs font-semibold uppercase tracking-widest text-slate-900 border border-slate-200 hover:border-slate-900 transition-colors bg-white"
              onClick={toggleMenu}
            >
              Aula Virtual
            </Link>
            <Link
              to="/admision"
              className="flex items-center justify-center w-full py-3 rounded-full text-xs font-semibold uppercase tracking-widest text-white bg-orange-700 hover:bg-orange-800 shadow-lg shadow-orange-700/20 transition-all"
              onClick={toggleMenu}
            >
              Admisión 2026
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default HomePage;