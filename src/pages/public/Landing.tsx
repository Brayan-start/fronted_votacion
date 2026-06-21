import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Vote, Shield, BarChart3, Fingerprint, ChevronRight, Sun, Moon, Users, Zap, Globe, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' as const },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { staggerChildren: 0.12 },
};

const childItem = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

const features = [
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    desc: 'Sistema de autenticación biométrica y encriptación de extremo a extremo para cada voto emitido.',
  },
  {
    icon: Fingerprint,
    title: 'Verificación Biométrica',
    desc: 'Identificación facial avanzada que asegura que cada votante sea único y elegible.',
  },
  {
    icon: BarChart3,
    title: 'Resultados en Tiempo Real',
    desc: 'Conteo automático y publicación instantánea de resultados con gráficos interactivos.',
  },
  {
    icon: Users,
    title: 'Gestión de Usuarios',
    desc: 'Administración centralizada de estudiantes, categorías y permisos de votación.',
  },
];

const stats = [
  { value: '99.9%', label: 'Disponibilidad' },
  { value: '< 2s', label: 'Tiempo de voto' },
  { value: '10K+', label: 'Votantes activos' },
  { value: '256-bit', label: 'Encriptación' },
];

const Landing: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.92]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Vote size={20} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">UPEA Vota</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </motion.button>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center sm:hidden">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          Iniciar Sesión <ChevronRight size={20} />
        </Link>
      </div>

      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-24 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 backdrop-blur-sm"
          >
            <Zap size={15} className="fill-blue-400" />
            Elecciones universitarias modernas
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Votaciones{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent">
              Seguras y Transparentes
            </span>
            <br />
            para tu Universidad
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-lg font-medium text-[var(--text-secondary)] sm:text-xl"
          >
            Plataforma electoral digital con autenticación biométrica, resultados en tiempo real
            y la máxima seguridad para garantizar elecciones justas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              to="/login"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-extrabold text-white shadow-2xl shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 transition-all"
            >
              Comenzar ahora
              <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] px-8 py-4 text-base font-bold text-[var(--text-primary)] hover:border-blue-500/40 hover:bg-[var(--bg-tertiary)] transition-all"
            >
              Crear cuenta
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 w-5 rounded-full border-2 border-[var(--text-tertiary)] flex items-start justify-center pt-1.5"
          >
            <div className="h-2 w-0.5 rounded-full bg-[var(--text-tertiary)]" />
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="relative border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div {...stagger} className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <motion.div key={stat.label} {...childItem} className="text-center">
                <div className="text-3xl font-black text-blue-400 sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm font-bold text-[var(--text-tertiary)]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-indigo-400">
              Características
            </span>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Todo lo que necesitas
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-[var(--text-secondary)]">
              Una plataforma completa para gestionar elecciones universitarias.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  {...childItem}
                  className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition-all hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 group-hover:from-blue-600/30 group-hover:to-indigo-600/30 transition-all">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-extrabold">{feature.title}</h3>
                  <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <motion.div {...fadeUp}>
            <span className="mb-4 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-amber-400">
              Beneficios
            </span>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              ¿Por qué UPEA Vota?
            </h2>
          </motion.div>
          <motion.div {...stagger} className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              { icon: Globe, title: 'Accesible', desc: 'Desde cualquier dispositivo, en cualquier momento. Sin necesidad de instalación.' },
              { icon: Shield, title: 'Transparente', desc: 'Cada voto es registrado y auditado. Resultados verificables por todos.' },
              { icon: Sparkles, title: 'Moderno', desc: 'Interfaz intuitiva con reconocimiento facial y últimas tecnologías.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} {...childItem} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                    <Icon size={26} />
                  </div>
                  <h3 className="mb-2 text-xl font-extrabold">{item.title}</h3>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <Vote size={18} />
              </div>
              <span className="text-base font-extrabold">UPEA Vota</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-tertiary)]">
              &copy; {new Date().getFullYear()} UPEA Vota. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-[var(--text-tertiary)] hover:text-blue-400 transition-colors">
                Iniciar Sesión
              </Link>
              <span className="text-[var(--border-color)]">|</span>
              <Link to="/register" className="text-sm font-bold text-[var(--text-tertiary)] hover:text-blue-400 transition-colors">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
