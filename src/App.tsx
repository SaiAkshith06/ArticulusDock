/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from './firebase';
import { 
  Bookmark, 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle, 
  Circle, 
  Trash2, 
  ExternalLink, 
  BookOpen,
  Chrome,
  Layout,
  Clock,
  Tag,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Download,
  Apple,
  Monitor,
  Terminal,
  Globe,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Moon,
  Sun,
  Copy,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import JSZip from 'jszip';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Logo = React.memo(({ className = "w-full h-full", primaryColor = "#8B4513", secondaryColor = "#5D4037", isBack = false }: { className?: string, primaryColor?: string, secondaryColor?: string, isBack?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id={`logo-primary-grad-${isBack}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isBack ? secondaryColor : primaryColor} />
        <stop offset="100%" stopColor={isBack ? "#2D1B15" : secondaryColor} />
      </linearGradient>
      <linearGradient id={`logo-glass-grad-${isBack}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
        <stop offset="50%" stopColor="white" stopOpacity="0.1" />
        <stop offset="100%" stopColor="white" stopOpacity="0.05" />
      </linearGradient>
      <filter id={`logo-glow-${isBack}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Main Bookmark Shape */}
    <path 
      d="M7 3C7 1.89543 7.89543 1 9 1H15C16.1046 1 17 1.89543 17 3V18L12 15L7 18V3Z" 
      fill={`url(#logo-primary-grad-${isBack})`}
      filter={isBack ? "" : `url(#logo-glow-${isBack})`}
    />
    
    {/* Bevel / Inner Shadow for depth */}
    <path 
      d="M8 3.5C8 3.22386 8.22386 3 8.5 3H15.5C15.7761 3 16 3.22386 16 3.5V15.5L12 13L8 15.5V3.5Z" 
      fill="black" 
      fillOpacity="0.1"
    />

    {/* Glass Reflection Layer */}
    {!isBack && (
      <path 
        d="M7.5 3.5C7.5 2.67157 8.17157 2 9 2H15C15.8284 2 16.5 2.67157 16.5 3.5V14.5L12 12L7.5 14.5V3.5Z" 
        fill="url(#logo-glass-grad-false)"
      />
    )}

    {/* Detail Lines (Pages) */}
    <path d="M9 4H15" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" strokeLinecap="round"/>
    <path d="M9 6H15" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" strokeLinecap="round"/>
    <path d="M9 8H15" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" strokeLinecap="round"/>

    {/* Dock Base (only on front) */}
    {!isBack && (
      <g>
        <defs>
          <linearGradient id="dock-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="50%" stopColor="#3E2723" />
            <stop offset="100%" stopColor="#2D1B15" />
          </linearGradient>
          <linearGradient id="dock-shine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="20%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.2" />
            <stop offset="80%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Main Dock Body - Layered for depth */}
        <path d="M3 18.5H21V21.5C21 21.7761 20.7761 22 20.5 22H3.5C3.22386 22 3 21.7761 3 21.5V18.5Z" fill="#1A110E"/>
        <path d="M3 18H21V21H3V18Z" fill="url(#dock-grad)"/>
        
        {/* Metallic Top Rail */}
        <rect x="2" y="17" width="20" height="1.2" rx="0.6" fill="#8B4513" />
        <rect x="2" y="17" width="20" height="0.6" rx="0.3" fill="white" fillOpacity="0.1" />
        
        {/* Shine Overlay */}
        <rect x="3" y="18" width="18" height="3" fill="url(#dock-shine)" pointerEvents="none" />
        
        {/* Micro-Details: Indicator LEDs */}
        <circle cx="5" cy="19.5" r="0.4" fill="#4CAF50" fillOpacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="7" cy="19.5" r="0.4" fill="white" fillOpacity="0.3" />
        <circle cx="9" cy="19.5" r="0.4" fill="white" fillOpacity="0.3" />
        
        {/* Micro-Details: "Ports" or Texture */}
        <rect x="15" y="19.2" width="1.5" height="0.6" rx="0.2" fill="black" fillOpacity="0.4" />
        <rect x="17.5" y="19.2" width="1.5" height="0.6" rx="0.2" fill="black" fillOpacity="0.4" />
      </g>
    )}
  </svg>
));

const GridBackground = React.memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" style={{ contain: 'strict' }}>
      {/* Light Grid */}
      <div 
        className="absolute inset-0 transition-opacity duration-400 will-change-opacity"
        style={{
          opacity: isDarkMode ? 0 : 0.05,
          backgroundImage: `radial-gradient(circle at 50% 50%, #E5C4A7 0%, transparent 800px), 
                            linear-gradient(to right, rgba(15, 23, 42, 0.08) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 1px, transparent 1px)`,
          backgroundSize: `100% 100%, 60px 60px, 60px 60px`
        }}
      />
      {/* Dark Grid */}
      <div 
        className="absolute inset-0 transition-opacity duration-400 will-change-opacity"
        style={{
          opacity: isDarkMode ? 0.1 : 0,
          backgroundImage: `radial-gradient(circle at 50% 50%, #E5C4A7 0%, transparent 800px), 
                            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: `100% 100%, 60px 60px, 60px 60px`
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,196,167,0.02)_0%,transparent_100%)]" />
    </div>
  );
});

interface Article {
  id: string;
  userId: string;
  groupId?: string;
  url: string;
  title: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  savedAt: Timestamp;
  isRead: boolean;
  tags?: string[];
}

interface Group {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
}

const IntroSection = React.memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const marqueeRows = useMemo(() => [1, 2, 3, 4, 5], []);
  const marqueeItems = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8], []);

  return (
    <section 
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ contain: 'strict' }}
    >
      {/* Background Layers for smooth transition - Stacked to avoid transparency glitch */}
      <div className="absolute inset-0 bg-bg z-0" /> 
      <div 
        className="absolute inset-0 bg-[#C8C8B6] transition-opacity duration-500 z-0" 
        style={{ opacity: isDarkMode ? 0 : 1 }}
      />

      {/* Background Marquee Text - Multiple rows to fill the middle area */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 lg:gap-8 opacity-20 pointer-events-none select-none overflow-hidden will-change-transform transition-[opacity] duration-400 z-10">
        {marqueeRows.map((row) => (
          <div 
            key={row}
            className={cn(
              "flex whitespace-nowrap will-change-transform w-max",
              row % 2 === 0 ? "animate-marquee-reverse" : "animate-marquee"
            )}
            style={{
              animationDuration: `${30 + row * 8}s`
            }}
          >
            {/* First Set */}
            <div className="flex gap-24 pr-24">
              {marqueeItems.map((i) => (
                <span key={i} className={cn(
                  "text-[12vw] font-display font-bold uppercase tracking-tighter will-change-[color,text-shadow]",
                  row % 2 === 0 && "outline-text"
                )}
                style={{
                  color: row % 2 === 0 ? 'transparent' : 'var(--marquee-text)',
                  textShadow: 'var(--marquee-glow)',
                  transition: 'color 0.4s ease, text-shadow 0.4s ease'
                }}
                >
                  ArticulusDock
                </span>
              ))}
            </div>
            {/* Second Set (Duplicate for seamless loop) */}
            <div className="flex gap-24 pr-24">
              {marqueeItems.map((i) => (
                <span key={`dup-${i}`} className={cn(
                  "text-[12vw] font-display font-bold uppercase tracking-tighter will-change-[color,text-shadow]",
                  row % 2 === 0 && "outline-text"
                )}
                style={{
                  color: row % 2 === 0 ? 'transparent' : 'var(--marquee-text)',
                  textShadow: 'var(--marquee-glow)',
                  transition: 'color 0.4s ease, text-shadow 0.4s ease'
                }}
                >
                  ArticulusDock
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Particles for Depth */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-20%"],
              opacity: [0, 0.3, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-accent rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* 3D Rotating Model (Logo) - Perfectly Centered */}
      <div className="relative z-20 perspective-2000 flex items-center justify-center">
        {/* Dynamic Shadow */}
        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-48 h-8 bg-black/20 blur-xl rounded-full scale-x-150 animate-shadow-pulse" />

        <div className="animate-logo-y will-change-transform">
          <div className="animate-logo-rotate-x will-change-transform">
            <div className="w-64 h-64 lg:w-[32rem] lg:h-[32rem] drop-shadow-[0_0_80px_rgba(93,64,55,0.3)] animate-logo-rotate-y will-change-transform preserve-3d">
              {/* Extruded Layers for Thickness */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute inset-0 backface-hidden"
                  style={{ transform: `translateZ(${i - 6}px)` }}
                >
                  <Logo 
                    className="w-full h-full" 
                    primaryColor="#8B4513" 
                    secondaryColor="#5D4037" 
                    isBack={i < 6}
                  />
                </div>
              ))}
              
              {/* Front Face (High Detail) */}
              <div className="absolute inset-0 backface-hidden" style={{ transform: 'translateZ(6px)' }}>
                <Logo className="w-full h-full" primaryColor="#8B4513" secondaryColor="#5D4037" />
              </div>
              
              {/* Back Face */}
              <div className="absolute inset-0 backface-hidden" style={{ transform: 'translateZ(-6px) rotateY(180deg)' }}>
                <Logo className="w-full h-full" primaryColor="#5D4037" secondaryColor="#3E2723" isBack />
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] bg-[#8B4513]/10 blur-[150px] rounded-full -z-10" />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-50 z-20">
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-ink/50 dark:text-white/50">Scroll to Sanctuary</span>
        <ChevronDown className="w-6 h-6 text-ink dark:text-white" />
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .outline-text {
          -webkit-text-stroke: 1px var(--marquee-stroke);
          color: transparent;
        }
      `}</style>
    </section>
  );
});

const LandingPage = React.memo(({ onLogin, isDarkMode, toggleDarkMode }: { onLogin: () => void, isDarkMode: boolean, toggleDarkMode: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="text-ink bg-bg min-h-screen selection:bg-accent/10 selection:text-accent overflow-x-hidden relative transition-colors duration-500">
      <GridBackground isDarkMode={isDarkMode} />

      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-8 py-8 lg:py-12">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-14 h-14 bg-accent text-[#1A1A1A] flex items-center justify-center font-display text-2xl rounded-2xl transition-all duration-700 shadow-2xl shadow-accent/30 group-hover:rotate-12 group-hover:scale-110">
              <Logo className="w-8 h-8" primaryColor="#8B4513" secondaryColor="#5D4037" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-display font-bold tracking-tight text-ink transition-colors duration-500">ArticulusDock</span>
              <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent text-[8px] font-bold uppercase tracking-widest rounded-md">Beta</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8 lg:gap-16">
            <div className="hidden lg:flex items-center gap-12 text-sm font-semibold tracking-tight text-muted">
              <a href="#features" className="hover:text-accent transition-all hover:translate-y-[-2px]">Features</a>
              <button onClick={() => navigate('/installation')} className="hover:text-accent transition-all hover:translate-y-[-2px]">Installation</button>
              <a href="#extensions" className="hover:text-accent transition-all hover:translate-y-[-2px]">Extensions</a>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-4 bg-surface border border-border rounded-2xl text-muted hover:text-accent transition-all shadow-sm"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={onLogin}
                className="btn-monopo shadow-xl shadow-accent/20"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Unicorn Studio Intro */}
      <IntroSection isDarkMode={isDarkMode} />

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex flex-col justify-center px-8 lg:pt-0"
      >
        <div 
          className="max-w-[1800px] mx-auto w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="opacity-100 translate-y-0">
                <div className="flex items-center gap-6 mb-12">
                  <div className="h-[2px] w-16 bg-accent rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-[0.5em] text-accent">Digital Sanctuary</span>
                </div>
                <h1 className="text-[12vw] lg:text-[9vw] font-display font-bold leading-[0.9] tracking-tighter mb-12">
                  Knowledge, <br />
                  <span className="text-accent italic font-light">Refined</span> <br />
                  for Focus.
                </h1>
                <p className="text-xl lg:text-2xl text-muted max-w-xl leading-relaxed font-light mb-16 text-glow">
                  ArticulusDock is a minimal space for your digital reading. Save articles from anywhere and read them in a distraction-free environment.
                </p>
                <div className="flex flex-col sm:flex-row gap-8">
                  <button onClick={onLogin} className="btn-monopo py-5 px-10 text-base">Get Started Free</button>
                  <a href="#features" className="btn-outline py-5 px-10 text-base flex items-center justify-center">How it works</a>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-5"
            >
              <div className="relative opacity-100 translate-y-0">
                <div className="aspect-[4/5] bg-surface rounded-[5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.12)] border border-border p-12 flex items-center justify-center overflow-hidden relative group">
                  <div className="absolute inset-0 bg-accent/5 opacity-30 group-hover:opacity-50 transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                  <Bookmark className="w-48 h-48 text-accent relative z-10 transition-transform duration-700 group-hover:scale-110" />
                  
                  {/* Decorative lines */}
                  <div className="absolute top-24 left-24 w-24 h-[1px] bg-accent/20" />
                  <div className="absolute top-24 left-24 w-[1px] h-24 bg-accent/20" />
                  <div className="absolute bottom-24 right-24 w-24 h-[1px] bg-accent/20" />
                  <div className="absolute bottom-24 right-24 w-[1px] h-24 bg-accent/20" />
                </div>

                {/* Floating elements */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-surface rounded-[3rem] shadow-2xl border border-border p-10 flex items-center justify-center animate-float-slow">
                  <Zap className="w-20 h-20 text-yellow-500" />
                </div>
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-surface rounded-[3.5rem] shadow-2xl border border-border p-12 flex items-center justify-center animate-float-delayed">
                  <Shield className="w-24 h-24 text-accent" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Marquee */}
      <div className="py-32 border-y border-border overflow-hidden bg-surface/80">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-32 mx-16">
              <span className="text-7xl lg:text-9xl font-display font-bold uppercase tracking-tighter text-ink">Read Better</span>
              <div className="w-6 h-6 bg-ink rotate-45" />
              <span className="text-7xl lg:text-9xl font-display font-bold uppercase tracking-tighter text-ink">Save Smarter</span>
              <div className="w-6 h-6 bg-ink rotate-45" />
              <span className="text-7xl lg:text-9xl font-display font-bold uppercase tracking-tighter text-ink">Focus More</span>
              <div className="w-6 h-6 bg-ink rotate-45" />
            </div>
          ))}
        </div>
      </div>

      {/* Features - Split Layout */}
      <section 
        id="features" 
        className="py-60 border-b border-border relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/5 rounded-full pointer-events-none" />
        
        <div className="max-w-[1800px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-40 lg:gap-60">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-40"
            >
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <span className="text-accent font-display text-2xl font-bold">01</span>
                  <div className="h-[1px] w-12 bg-border" />
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-muted">Experience</span>
                </div>
                <h2 className="text-7xl lg:text-9xl font-display font-bold leading-[0.9] tracking-tighter">Distraction <br/><span className="text-accent italic font-light">Free</span>.</h2>
                <p className="text-xl text-muted max-w-md leading-relaxed font-light text-glow">
                  We strip away the noise. No ads, no tracking, no clutter. Just you and the content you care about in a beautiful reading environment.
                </p>
              </div>
              <div className="aspect-[4/5] bg-surface rounded-[4rem] border border-border overflow-hidden group shadow-2xl shadow-black/5 relative">
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-[0.5em] bg-ink px-8 py-4 rounded-full">Pure Content</span>
                </div>
                <img 
                  src="/reader_mockup.svg" 
                  alt="ArticulusDock Reader Mode Screenshot" 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-2"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-40 lg:pt-80"
            >
              <div className="aspect-[4/5] bg-surface rounded-[4rem] border border-border overflow-hidden group shadow-2xl shadow-black/5 relative">
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-[0.5em] bg-ink px-8 py-4 rounded-full">Smart Archive</span>
                </div>
                <img 
                  src="/dashboard_mockup.svg" 
                  alt="ArticulusDock Dashboard Screenshot" 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <span className="text-accent font-display text-2xl font-bold">02</span>
                  <div className="h-[1px] w-12 bg-border" />
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-muted">Organization</span>
                </div>
                <h2 className="text-7xl lg:text-9xl font-display font-bold leading-[0.9] tracking-tighter">Smart <br/><span className="text-accent italic font-light">Collections</span>.</h2>
                <p className="text-xl text-muted max-w-md leading-relaxed font-light text-glow">
                  Organize your reading list into custom groups. Whether it's research, hobbies, or daily news, ArticulusDock keeps your digital life tidy.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extensions Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        id="extensions" 
        className="py-60 bg-surface/80 relative overflow-hidden"
      >
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-20 mb-40">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-6">
                <div className="h-[2px] w-12 bg-accent rounded-full" />
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Availability</span>
              </div>
              <h2 className="text-8xl lg:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter">
                Everywhere <br/>You <span className="text-accent italic font-light">Are</span>.
              </h2>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xl text-muted max-w-sm leading-relaxed font-light mb-4 text-glow"
            >
              Our lightweight extensions for Chrome, Firefox, and Safari make saving articles as easy as a single click from any device.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {['Chrome', 'Firefox', 'Safari'].map((browser, idx) => (
              <motion.div 
                key={browser} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group p-16 bg-surface rounded-[3rem] border border-border hover:border-accent transition-all duration-700 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-24">
                  <div className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    {browser === 'Chrome' ? <Chrome className="w-8 h-8 text-muted group-hover:text-accent transition-colors" /> : 
                     browser === 'Firefox' ? <Globe className="w-8 h-8 text-muted group-hover:text-accent transition-colors" /> :
                     <Smartphone className="w-8 h-8 text-muted group-hover:text-accent transition-colors" />}
                  </div>
                  {browser === 'Chrome' && <ArrowRight className="w-8 h-8 text-muted group-hover:text-accent transition-all group-hover:translate-x-2" />}
                </div>
                <h3 className="text-5xl font-display font-bold mb-6">{browser}</h3>
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", browser === 'Chrome' ? "bg-green-500 animate-pulse" : "bg-accent/40")} />
                  <p className="text-muted text-xs font-bold uppercase tracking-widest">
                    {browser === 'Chrome' ? 'Available Now' : 'Coming Soon'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer 
        className="py-32 px-8 border-t border-border"
      >
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-20">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-ink text-bg flex items-center justify-center font-display text-2xl rounded-2xl group-hover:bg-accent group-hover:text-[#1A1A1A] transition-all duration-500">
              <Logo className="w-7 h-7" primaryColor="#8B4513" secondaryColor="#5D4037" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-black dark:text-white">ArticulusDock</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-xs font-bold uppercase tracking-widest text-muted">
            <button onClick={() => navigate('/privacy')} className="hover:text-accent transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-accent transition-colors">Terms</button>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted/40">
            © 2026 ArticulusDock Archive. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(4deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(20px) rotate(-4deg); }
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 9s ease-in-out infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
});

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-ink p-8 lg:p-20 selection:bg-accent/10 selection:text-accent">
      <div className="max-w-4xl mx-auto space-y-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-muted hover:text-accent transition-colors group">
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
      <div className="space-y-8">
        <h1 className="text-6xl lg:text-8xl font-display font-bold tracking-tighter">Privacy <br/><span className="text-accent italic font-light">Policy</span>.</h1>
        <p className="text-muted text-sm font-bold uppercase tracking-[0.3em]">Last Updated: March 2026</p>
      </div>
      <div className="space-y-12 text-lg leading-relaxed font-light text-muted/80">
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">01. Information We Collect</h2>
          <p>We collect minimal information necessary to provide our services. This includes your Google account information (name, email, profile picture) for authentication, and the articles you save to your ArticulusDock archive.</p>
        </section>
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">02. How We Use Your Data</h2>
          <p>Your data is used solely to sync your reading list across your devices. We do not sell your data, and we do not use it for advertising purposes. Your reading habits are private to you.</p>
        </section>
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">03. Data Security</h2>
          <p>We use industry-standard security measures to protect your data. All data is stored securely using Firebase and is only accessible by you through your authenticated Google account.</p>
        </section>
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">04. Your Rights</h2>
          <p>You have the right to access, modify, or delete your data at any time. You can delete your account and all associated data directly from the settings menu in the dashboard.</p>
        </section>
      </div>
    </div>
  </div>
  );
};

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-ink p-8 lg:p-20 selection:bg-accent/10 selection:text-accent">
      <div className="max-w-4xl mx-auto space-y-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-muted hover:text-accent transition-colors group">
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
      <div className="space-y-8">
        <h1 className="text-6xl lg:text-8xl font-display font-bold tracking-tighter">Terms of <br/><span className="text-accent italic font-light">Service</span>.</h1>
        <p className="text-muted text-sm font-bold uppercase tracking-[0.3em]">Last Updated: March 2026</p>
      </div>
      <div className="space-y-12 text-lg leading-relaxed font-light text-muted/80">
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">01. Acceptance of Terms</h2>
          <p>By using ArticulusDock, you agree to these terms. If you do not agree, please do not use the service. We reserve the right to update these terms at any time.</p>
        </section>
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">02. User Conduct</h2>
          <p>You are responsible for your use of the service. You may not use ArticulusDock for any illegal purposes or to violate the rights of others. We reserve the right to terminate accounts that violate these terms.</p>
        </section>
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">03. Intellectual Property</h2>
          <p>ArticulusDock and its original content are the property of ArticulusDock Archive. The articles you save remain the property of their respective owners.</p>
        </section>
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink uppercase tracking-tight">04. Limitation of Liability</h2>
          <p>ArticulusDock is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
        </section>
      </div>
    </div>
  </div>
  );
};

const InstallationGuide = ({ 
  onDownload, 
  user, 
  copyStatus, 
  setCopyStatus 
}: { 
  onDownload: () => void;
  user: any;
  copyStatus: boolean;
  setCopyStatus: (status: boolean) => void;
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'extension' | 'manual'>('extension');

  return (
    <div className="min-h-screen bg-bg text-ink p-8 lg:p-20 selection:bg-accent/10 selection:text-accent">
      <div className="max-w-4xl mx-auto space-y-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-muted hover:text-accent transition-colors group">
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
        
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="h-[2px] w-16 bg-accent rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.5em] text-accent">Getting Started</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-display font-bold tracking-tighter">How to <br/><span className="text-accent italic font-light">Save Content</span>.</h1>
          <p className="text-xl text-muted font-light leading-relaxed max-w-2xl">
            Choose your preferred way to save articles to your ArticulusDock sanctuary.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-surface border border-border rounded-[2rem] w-fit">
          <button 
            onClick={() => setActiveTab('extension')}
            className={cn(
              "px-8 py-4 rounded-[1.5rem] text-sm font-bold transition-all",
              activeTab === 'extension' ? "bg-accent text-bg shadow-xl shadow-accent/20" : "text-muted hover:text-ink"
            )}
          >
            Browser Extension
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={cn(
              "px-8 py-4 rounded-[1.5rem] text-sm font-bold transition-all",
              activeTab === 'manual' ? "bg-accent text-bg shadow-xl shadow-accent/20" : "text-muted hover:text-ink"
            )}
          >
            Manual Addition
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'extension' ? (
            <motion.div 
              key="extension"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-12"
            >
              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">01</div>
                  <h3 className="text-2xl font-display font-bold">Download the Extension</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Click the button below to download the extension package. This contains all the files needed for ArticulusDock to work in your browser.
                </p>
                <button onClick={onDownload} className="btn-monopo flex items-center gap-4">
                  <Download className="w-5 h-5" />
                  Download extension.zip
                </button>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">02</div>
                  <h3 className="text-2xl font-display font-bold">Extract the Files</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Locate the downloaded <code className="bg-surface px-2 py-1 rounded border border-border">lumina-extension.zip</code> file on your computer. Right-click it and select <strong>"Extract All"</strong> or <strong>"Unzip"</strong>. Save the extracted folder somewhere easy to find, like your Desktop.
                </p>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">03</div>
                  <h3 className="text-2xl font-display font-bold">Enable Developer Mode</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Open a new tab in Chrome and go to <code className="bg-surface px-2 py-1 rounded border border-border">chrome://extensions/</code>. In the top-right corner, toggle the <strong>"Developer mode"</strong> switch to <strong>ON</strong>.
                </p>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">04</div>
                  <h3 className="text-2xl font-display font-bold">Load the Extension</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Click the <strong>"Load unpacked"</strong> button that appeared in the top-left. Select the <strong>folder</strong> you extracted in Step 2.
                </p>
                <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <p className="text-sm text-muted">
                    <strong>Success!</strong> You should now see the ArticulusDock icon in your extensions list. Pin it to your toolbar for easy access.
                  </p>
                </div>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">05</div>
                  <h3 className="text-2xl font-display font-bold">Configure the Extension</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Open the extension from your browser's toolbar and paste your unique User ID to link your sanctuary.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-8 bg-bg border border-border rounded-[2rem] shadow-sm">
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Your Unique User ID</span>
                    <code className="block text-lg font-mono text-accent break-all">{user?.uid}</code>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user?.uid || '');
                      setCopyStatus(true);
                      setTimeout(() => setCopyStatus(false), 2000);
                    }}
                    className="btn-monopo w-full sm:w-auto flex items-center justify-center gap-4"
                  >
                    {copyStatus ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copyStatus ? 'Copied' : 'Copy ID'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-12"
            >
              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">01</div>
                  <h3 className="text-2xl font-display font-bold">Sign In to Dashboard</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Access your personal sanctuary by signing in with your Google account from the main page.
                </p>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">02</div>
                  <h3 className="text-2xl font-display font-bold">Click "Add Article"</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Look for the <strong>"Add Article"</strong> button in the top right corner of your dashboard.
                </p>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">03</div>
                  <h3 className="text-2xl font-display font-bold">Paste the URL</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Copy the URL of the article you want to save from your browser's address bar and paste it into the input field.
                </p>
              </div>

              <div className="bento-card p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-accent text-bg flex items-center justify-center rounded-2xl font-display text-xl">04</div>
                  <h3 className="text-2xl font-display font-bold">Save and Read</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Click <strong>"Add"</strong>. The article will be instantly processed and added to your unread list, ready for a distraction-free reading session.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-12 flex justify-center">
          <button onClick={() => navigate('/')} className="btn-outline px-12 py-6">
            I'm ready, take me home
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumina-dark-mode');
      return saved === 'true';
    }
    return false;
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [duplicateArticle, setDuplicateArticle] = useState<Article | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showExtensionInfo, setShowExtensionInfo] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [isReadMode, setIsReadMode] = useState(false);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [articleSummary, setArticleSummary] = useState<string | null>(null);
  
  // Beta: AI features are free for everyone
  const isPro = true;
  const showPaywall = false;
  const setShowPaywall = (val: boolean) => {};

  const navigate = useNavigate();
  const location = useLocation();

  React.useLayoutEffect(() => {
    const forceDark = location.pathname === '/dashboard' || isReadMode;
    if (forceDark || isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lumina-dark-mode', isDarkMode.toString());
  }, [isDarkMode, location.pathname, isReadMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const downloadExtension = async () => {
    const zip = new JSZip();
    
    const manifest = {
      "manifest_version": 3,
      "name": "ArticulusDock Save",
      "version": "1.17",
      "description": "Save articles to your ArticulusDock library with a single click.",
      "permissions": ["activeTab", "storage", "tabs", "scripting"],
      "host_permissions": ["*://*.run.app/*", "http://localhost/*", window.location.origin + "/*"],
      "action": { "default_popup": "popup.html" },
      "options_page": "settings.html",
      "background": { "service_worker": "background.js" }
    };

    const backgroundJs = `
chrome.runtime.onInstalled.addListener(function(details) {
  chrome.storage.local.set({ serverUrl: "` + window.location.origin + `" });
  if (details.reason === "install") {
    chrome.tabs.create({ url: "` + window.location.origin + `" });
  }
});
`;

    const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;600&display=swap');
    body { width: 320px; padding: 24px; font-family: 'Work Sans', sans-serif; background: #F9F9F7; color: #1A1A1A; margin: 0; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
    .logo { width: 36px; height: 36px; background: #E5C4A7; color: #1A1A1A; display: flex; align-items: center; justify-content: center; font-family: 'Anton', sans-serif; font-size: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(229, 196, 167, 0.2); }
    .title { font-family: 'Anton', sans-serif; font-size: 20px; font-weight: 400; letter-spacing: -0.5px; }
    .field { margin-bottom: 24px; }
    label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #8E9299; letter-spacing: 1px; margin-bottom: 8px; }
    select { width: 100%; padding: 12px; background: #FFFFFF; border: 1px solid rgba(0, 0, 0, 0.08); color: #1A1A1A; font-size: 12px; outline: none; transition: all 0.3s; border-radius: 8px; }
    select:focus { border-color: #E5C4A7; box-shadow: 0 0 0 3px rgba(229, 196, 167, 0.1); }
    .btn { width: 100%; padding: 14px; background: #1A1A1A; color: #F9F9F7; border: none; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.3s; border-radius: 30px; }
    .btn:hover { background: #E5C4A7; color: #1A1A1A; transform: translateY(-1px); }
    .btn:active { transform: scale(0.98); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { margin-top: 16px; font-size: 11px; text-align: center; color: #8E9299; min-height: 16px; font-weight: 500; }
    .settings-link { display: block; margin-top: 24px; text-align: center; font-size: 10px; color: #8E9299; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; transition: color 0.3s; }
    .settings-link:hover { color: #1A1A1A; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px;">
        <path d="M4 18H20V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V18Z" fill="currentColor" opacity="0.3"/>
        <path d="M2 18H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V16L12 13L8 16V4Z" fill="currentColor"/>
        <path d="M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V16L12 13L8 16V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="title">ArticulusDock</div>
  </div>
  <div class="field">
    <label>Collection</label>
    <select id="groupSelect">
      <option value="">NO COLLECTION</option>
    </select>
  </div>
  <button id="saveBtn" class="btn">Archive Article</button>
  <div id="status" class="status"></div>
  <a href="settings.html" class="settings-link">Settings</a>
  <script src="popup.js"></script>
</body>
</html>`;

    const popupJs = `
(function() {
  const debug = function(msg) {
    const debugEl = document.getElementById('debug');
    if (debugEl) {
      debugEl.style.display = 'block';
      debugEl.textContent += (new Date().toLocaleTimeString()) + ': ' + msg + '\\n';
      debugEl.scrollTop = debugEl.scrollHeight;
    }
    console.log('ArticulusDock: ' + msg);
  };

  debug('Popup v1.17 Initializing...');
  
  const init = function() {
    const saveBtn = document.getElementById('saveBtn');
    const groupSelect = document.getElementById('groupSelect');
    const status = document.getElementById('status');
    if (!saveBtn || !status || !groupSelect) {
      debug('UI elements not found');
      return;
    }

    // Fetch groups from ArticulusDock tab
    const fetchGroups = async function() {
      try {
        const storage = await chrome.storage.local.get(['serverUrl']);
        const serverUrl = storage.serverUrl || '` + window.location.origin + `';
        const hostname = new URL(serverUrl).hostname;
        const tabs = await chrome.tabs.query({});
        const luminaTab = tabs.find(t => t.url && t.url.includes(hostname));
        
        if (luminaTab) {
          const result = await chrome.scripting.executeScript({
            target: { tabId: luminaTab.id },
            world: 'MAIN',
            func: function() {
              return window.LUMINA_GROUPS || [];
            }
          });
          const groups = result[0].result;
          if (groups && groups.length > 0) {
            groups.forEach(g => {
              const opt = document.createElement('option');
              opt.value = g.id;
              opt.textContent = g.name;
              groupSelect.appendChild(opt);
            });
            debug('Groups loaded: ' + groups.length);
          }
        }
      } catch (e) {
        debug('Failed to fetch groups: ' + e.message);
      }
    };

    fetchGroups();

    saveBtn.addEventListener('click', async function() {
      debug('Save button clicked');
      try {
        saveBtn.disabled = true;
        status.textContent = 'Saving...';
        const groupId = groupSelect.value || null;

        debug('Querying active tab...');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          status.textContent = 'Error: No active tab found.';
          debug('No active tab found');
          saveBtn.disabled = false;
          return;
        }
        debug('Active tab: ' + tab.url);

        debug('Fetching storage...');
        const storage = await chrome.storage.local.get(['userId', 'serverUrl']);
        const userId = storage.userId;
        const serverUrl = storage.serverUrl || '` + window.location.origin + `';
        debug('User ID: ' + userId + ', Server: ' + serverUrl);

        if (!userId) {
          status.textContent = 'Set User ID in settings.';
          debug('User ID missing');
          saveBtn.disabled = false;
          return;
        }

        const cleanUrl = serverUrl.trim().replace(/\\/+$/, '');
        const hostname = new URL(cleanUrl).hostname;
        debug('Hostname: ' + hostname);

        debug('Searching for ArticulusDock tab...');
        const tabs = await chrome.tabs.query({});
        const luminaTab = tabs.find(t => t.url && t.url.includes(hostname));
        debug('ArticulusDock tab found: ' + !!luminaTab);

        let result;
        if (luminaTab) {
          status.textContent = 'Saving via ArticulusDock tab...';
          try {
            debug('Executing script in MAIN world...');
            const scriptResult = await chrome.scripting.executeScript({
              target: { tabId: luminaTab.id },
              world: 'MAIN',
              func: async function(apiUrl, body) {
                const helper = window.saveArticleToFirestore;
                if (typeof helper === 'function') {
                  try {
                    const result = await helper(body.url, body.title, body.excerpt, body.groupId);
                    return { ok: true, method: 'Tab Helper', data: { success: true, id: result.id } };
                  } catch (e) { return { ok: false, method: 'Tab Helper', error: e.message }; }
                }
                try {
                  const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                  const isJson = res.headers.get('content-type')?.includes('application/json');
                  const data = isJson ? await res.json() : await res.text();
                  return { 
                    ok: res.ok, 
                    method: 'Tab Fetch',
                    status: res.status,
                    data: data, 
                    isHtml: res.headers.get('content-type')?.includes('text/html') 
                  };
                } catch (e) { return { ok: false, method: 'Tab Fetch', error: e.message }; }
              },
              args: [cleanUrl + '/api/save', { userId, url: tab.url, title: tab.title, groupId }]
            });
            result = scriptResult[0].result;
            debug('Script result: ' + JSON.stringify(result));
          } catch (scriptErr) {
            debug('Scripting API error: ' + scriptErr.message);
            result = { ok: false, method: 'Scripting API', error: scriptErr.message };
          }
        } else {
          status.textContent = 'Saving directly...';
          try {
            debug('Direct fetch to server...');
            const res = await fetch(cleanUrl + '/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId, url: tab.url, title: tab.title, groupId })
            });
            const isJson = res.headers.get('content-type')?.includes('application/json');
            result = { 
              ok: res.ok, 
              method: 'Direct Fetch',
              status: res.status,
              data: isJson ? await res.json() : await res.text(), 
              isHtml: res.headers.get('content-type')?.includes('text/html') 
            };
            debug('Direct fetch result: ' + JSON.stringify(result));
          } catch (fetchErr) {
            debug('Direct fetch error: ' + fetchErr.message);
            result = { ok: false, method: 'Direct Fetch', error: fetchErr.message };
          }
        }

        if (!result) {
          status.textContent = 'Error: No response from script.';
          debug('No result returned');
        } else if (result.isHtml) {
          status.textContent = 'Session blocked. Open ArticulusDock tab.';
          debug('Session blocked (HTML response)');
        } else if (result.ok) {
          status.textContent = 'Saved!';
          debug('Success!');
          setTimeout(function() { window.close(); }, 1000);
        } else {
          const errorMsg = result.error || (result.data && result.data.error) || (result.status ? 'Status ' + result.status : 'Failed');
          status.textContent = '[' + (result.method || 'Error') + '] ' + errorMsg;
          debug('Failed: ' + errorMsg);
        }
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
      } finally {
        saveBtn.disabled = false;
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

    const settingsHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;600&display=swap');
    body { width: 420px; padding: 32px; font-family: 'Work Sans', sans-serif; background: #F9F9F7; color: #1A1A1A; margin: 0; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
    .logo { width: 44px; height: 44px; background: #E5C4A7; color: #1A1A1A; display: flex; align-items: center; justify-content: center; font-family: 'Anton', sans-serif; font-size: 24px; border-radius: 12px; }
    .title { font-family: 'Anton', sans-serif; font-size: 28px; font-weight: 400; letter-spacing: -0.5px; }
    .section { background: #FFFFFF; border: 1px solid rgba(0, 0, 0, 0.08); padding: 24px; margin-bottom: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
    label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #8E9299; letter-spacing: 1px; margin-bottom: 12px; }
    input { width: 100%; padding: 14px; background: #F9F9F7; border: 1px solid rgba(0, 0, 0, 0.08); color: #1A1A1A; font-size: 12px; outline: none; box-sizing: border-box; margin-bottom: 20px; transition: all 0.3s; border-radius: 8px; }
    input:focus { border-color: #E5C4A7; box-shadow: 0 0 0 3px rgba(229, 196, 167, 0.1); }
    .btn { width: 100%; padding: 16px; background: #1A1A1A; color: #F9F9F7; border: none; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.3s; border-radius: 30px; }
    .btn:hover { background: #E5C4A7; color: #1A1A1A; transform: translateY(-1px); }
    .btn-secondary { background: transparent; color: #1A1A1A; border: 1px solid #1A1A1A; margin-top: 12px; }
    .btn-secondary:hover { background: #1A1A1A; color: #F9F9F7; }
    .btn-accent { background: rgba(229, 196, 167, 0.05); color: #E5C4A7; border: 1px solid rgba(229, 196, 167, 0.1); }
    .btn-accent:hover { background: rgba(229, 196, 167, 0.1); }
    .status { margin-top: 20px; font-size: 12px; text-align: center; color: #E5C4A7; min-height: 18px; font-weight: 600; }
    .info { font-size: 11px; color: #8E9299; margin-top: 12px; line-height: 1.6; font-weight: 400; }
    .footer-link { display: inline-block; margin-top: 32px; font-size: 10px; color: #8E9299; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 1px solid transparent; transition: all 0.3s; }
    .footer-link:hover { color: #1A1A1A; border-bottom-color: #1A1A1A; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px;">
        <path d="M12 4L4 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M12 4L20 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="6" y="14" width="12" height="3" rx="1" fill="currentColor"/>
      </svg>
    </div>
    <div class="title">Settings</div>
  </div>
  
  <div class="section">
    <label>Quick Configuration</label>
    <button id="syncBtn" class="btn btn-accent">Sync from Dashboard</button>
    <div class="info">Automatically fetch your User ID from an active ArticulusDock tab.</div>
  </div>

  <div class="field-group">
    <label>Manual Configuration</label>
    <input type="text" id="userId" placeholder="USER ID">
    <input type="text" id="serverUrl" placeholder="SERVER URL">
  </div>
  
  <button id="saveBtn" class="btn">Apply Settings</button>
  <button id="testBtn" class="btn btn-secondary">Test Connection</button>
  <div id="status" class="status"></div>
  
  <div style="margin-top: 40px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 24px;">
    <a href="` + window.location.origin + `" target="_blank" class="footer-link">Open Dashboard</a>
  </div>
  
  <script src="settings.js"></script>
</body>
</html>`;

    const settingsJs = `
(function() {
  console.log('ArticulusDock Settings v1.8 Initializing...');
  
  const defaultServerUrl = '` + window.location.origin + `';
  
  const init = function() {
    const userIdInput = document.getElementById('userId');
    const serverUrlInput = document.getElementById('serverUrl');
    const saveBtn = document.getElementById('saveBtn');
    const testBtn = document.getElementById('testBtn');
    const syncBtn = document.getElementById('syncBtn');
    const status = document.getElementById('status');

    if (!userIdInput || !saveBtn) return;

    // Load saved settings
    chrome.storage.local.get(['userId', 'serverUrl'], function(storage) {
      if (storage.userId) userIdInput.value = storage.userId;
      serverUrlInput.value = storage.serverUrl || defaultServerUrl;
    });

    // Save Settings
    saveBtn.addEventListener('click', async function() {
      const userId = userIdInput.value.trim();
      const serverUrl = serverUrlInput.value.trim();
      if (!userId) { status.textContent = 'User ID is required.'; return; }
      await chrome.storage.local.set({ userId, serverUrl });
      status.textContent = 'Settings saved!';
      setTimeout(function() { status.textContent = ''; }, 3000);
    });

    // Auto-Sync
    syncBtn.addEventListener('click', async function() {
      status.textContent = 'Searching for ArticulusDock tab...';
      try {
        const hostname = new URL(defaultServerUrl).hostname;
        const tabs = await chrome.tabs.query({});
        const luminaTab = tabs.find(function(t) { return t.url && t.url.includes(hostname); });
        
        if (!luminaTab) {
          status.textContent = 'ArticulusDock tab not found. Open it first.';
          return;
        }

        const result = await chrome.scripting.executeScript({
          target: { tabId: luminaTab.id },
          func: function() {
            const userIdElement = document.querySelector('[data-user-id]');
            if (userIdElement) return userIdElement.getAttribute('data-user-id');
            return window['LUMINA_USER_ID'] || null;
          }
        });

        const foundId = result[0].result;
        if (foundId) {
          userIdInput.value = foundId;
          status.textContent = 'User ID synced!';
        } else {
          status.textContent = 'Could not find ID. Please enter manually.';
        }
      } catch (e) {
        status.textContent = 'Sync failed: ' + e.message;
      }
    });

    // Test Connection
    testBtn.addEventListener('click', async function() {
      status.textContent = 'Testing...';
      try {
        const url = serverUrlInput.value.trim() || defaultServerUrl;
        const cleanUrl = url.replace(/\\/+$/, '');
        const res = await fetch(cleanUrl + '/api/health');
        if (res.ok) status.textContent = 'Connected!';
        else status.textContent = 'Failed: ' + res.status;
      } catch (e) {
        status.textContent = 'Error: ' + e.message;
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    zip.file("background.js", backgroundJs);
    zip.file("popup.html", popupHtml);
    zip.file("popup.js", popupJs);
    zip.file("settings.html", settingsHtml);
    zip.file("settings.js", settingsJs);

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumina-extension.zip";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        if (location.pathname === '/') {
          navigate('/dashboard');
        }
        // Ensure user document exists
        const userRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: Timestamp.now()
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        if (location.pathname === '/dashboard') {
          navigate('/');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Expose a helper to the window for the extension to use
    const handleExtensionSave = async (e: any) => {
      const { url, title, excerpt, content, groupId } = e.detail;
      if (!user) {
        console.error("ArticulusDock: User not authenticated in tab.");
        window.dispatchEvent(new CustomEvent('ARTICULUSDOCK_SAVE_RESPONSE', {
          detail: { success: false, error: "User not authenticated in ArticulusDock tab" }
        }));
        return;
      }
      
      console.log("ArticulusDock: Saving article for user:", user.uid, "URL:", url, "Group:", groupId);
      
      const existing = articles.find(a => a.url === url);
      if (existing) {
        console.warn("ArticulusDock: Duplicate article detected:", url);
        window.dispatchEvent(new CustomEvent('ARTICULUSDOCK_SAVE_RESPONSE', {
          detail: { success: false, error: "This article is already in your ArticulusDock." }
        }));
        return;
      }

      const path = 'articles';
      try {
        const docRef = await addDoc(collection(db, path), {
          userId: user.uid,
          url,
          title,
          excerpt: excerpt || "Saved from ArticulusDock Extension",
          content: content || null,
          savedAt: Timestamp.now(),
          isRead: false,
          tags: [],
          groupId: groupId || null
        });
        console.log("ArticulusDock: Save successful! ID:", docRef.id);
        window.dispatchEvent(new CustomEvent('ARTICULUSDOCK_SAVE_RESPONSE', {
          detail: { success: true, id: docRef.id }
        }));
      } catch (e: any) {
        console.error("ArticulusDock: Firestore save failed:", e.message);
        window.dispatchEvent(new CustomEvent('ARTICULUSDOCK_SAVE_RESPONSE', {
          detail: { success: false, error: e.message }
        }));
        handleFirestoreError(e, OperationType.CREATE, path);
      }
    };

    window.addEventListener('ARTICULUSDOCK_SAVE', handleExtensionSave);
    
    // Expose groups for the extension to fetch
    (window as any).LUMINA_GROUPS = groups.map(g => ({ id: g.id, name: g.name }));
    
    return () => {
      window.removeEventListener('ARTICULUSDOCK_SAVE', handleExtensionSave);
      delete (window as any).LUMINA_GROUPS;
    };
  }, [user, groups]);

  useEffect(() => {
    if (!user) {
      setArticles([]);
      return;
    }

    const q = query(
      collection(db, 'articles'),
      where('userId', '==', user.uid),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      return;
    }

    const q = query(
      collection(db, 'groups'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
      setGroups(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'groups');
    });

    return () => unsubscribe();
  }, [user]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           article.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filter === 'all' ? true : 
                           filter === 'read' ? article.isRead : !article.isRead;
      const matchesGroup = selectedGroupId ? article.groupId === selectedGroupId : true;
      return matchesSearch && matchesFilter && matchesGroup;
    });
  }, [articles, searchQuery, filter, selectedGroupId]);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName) return;

    try {
      await addDoc(collection(db, 'groups'), {
        userId: user.uid,
        name: newGroupName,
        description: newGroupDescription,
        createdAt: Timestamp.now()
      });
      setNewGroupName('');
      setNewGroupDescription('');
      setShowAddGroupModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'groups');
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'groups', id));
      if (selectedGroupId === id) setSelectedGroupId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `groups/${id}`);
    }
  };

  const assignToGroup = async (articleId: string, groupId: string | null) => {
    try {
      await updateDoc(doc(db, 'articles', articleId), {
        groupId: groupId || null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `articles/${articleId}`);
    }
  };

  const checkDuplicate = (url: string) => {
    return articles.find(a => a.url === url);
  };

  const handleAddArticle = async (e: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!user || !newUrl) return;

    const existing = checkDuplicate(newUrl);
    if (existing && !force) {
      setDuplicateArticle(existing);
      setShowDuplicateModal(true);
      return;
    }

    setShowDuplicateModal(false);
    setIsAdding(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ url: newUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract metadata');
      }

      const { metadata } = await response.json();
      const domain = new URL(newUrl).hostname;
      
      await addDoc(collection(db, 'articles'), {
        userId: user.uid,
        url: newUrl,
        title: metadata.title || `Article from ${domain}`,
        excerpt: metadata.excerpt || "Saved manually from ArticulusDock dashboard.",
        content: metadata.content || null,
        thumbnail: metadata.thumbnail || null,
        savedAt: Timestamp.now(),
        isRead: false,
        tags: []
      });
      setNewUrl('');
      setShowAddModal(false);
      setDuplicateArticle(null);
    } catch (error) {
      console.error("Error adding article:", error);
      // Fallback if AI fails
      try {
        const domain = new URL(newUrl).hostname;
        await addDoc(collection(db, 'articles'), {
          userId: user.uid,
          url: newUrl,
          title: `Article from ${domain}`,
          excerpt: "Saved manually from ArticulusDock dashboard.",
          savedAt: Timestamp.now(),
          isRead: false,
          tags: []
        });
        setNewUrl('');
        setShowAddModal(false);
      } catch (innerError) {
        console.error("Fallback error adding article:", innerError);
      }
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    // Beta: User status logic simplified
  }, [user]);

  const handleSummarize = async (article: Article) => {
    setIsSummarizing(true);
    setArticleSummary(null);
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          url: article.url, 
          title: article.title,
          content: article.excerpt // Fallback to excerpt if full content extraction isn't implemented
        })
      });
      const data = await response.json();
      if (data.summary) {
        setArticleSummary(data.summary);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const loadSampleArticles = async () => {
    if (!user) return;
    const samples = [
      {
        title: "The Future of Minimalist Design",
        url: "https://example.com/minimalist-design",
        excerpt: "Exploring how simplicity is becoming the ultimate sophistication in digital interfaces.",
        thumbnail: "https://picsum.photos/seed/design/800/600"
      },
      {
        title: "Deep Work: Rules for Focused Success",
        url: "https://example.com/deep-work",
        excerpt: "Why the ability to focus without distraction is becoming increasingly rare and valuable.",
        thumbnail: "https://picsum.photos/seed/focus/800/600"
      },
      {
        title: "The Art of Digital Archiving",
        url: "https://example.com/digital-archiving",
        excerpt: "How to curate your digital knowledge base for long-term accessibility and insight.",
        thumbnail: "https://picsum.photos/seed/archive/800/600"
      }
    ];

    try {
      for (const sample of samples) {
        await addDoc(collection(db, 'articles'), {
          ...sample,
          userId: user.uid,
          savedAt: Timestamp.now(),
          isRead: false,
          tags: ['sample']
        });
      }
    } catch (error) {
      console.error("Error loading sample articles:", error);
    }
  };

  const toggleRead = async (article: Article) => {
    try {
      await updateDoc(doc(db, 'articles', article.id), {
        isRead: !article.isRead
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `articles/${article.id}`);
    }
  };

  const deleteArticle = async (id: string) => {
    // Replaced confirm() with a direct action for now, or could implement a custom modal
    try {
      await deleteDoc(doc(db, 'articles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `articles/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
        <GridBackground isDarkMode={isDarkMode} />
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-2 border-accent/20 border-t-accent rounded-[2rem] shadow-2xl shadow-accent/10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo className="w-8 h-8 animate-pulse" primaryColor="#8B4513" secondaryColor="#5D4037" />
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-12 text-[10px] font-bold uppercase tracking-[0.5em] text-muted/40"
        >
          Entering Sanctuary
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLogin={loginWithGoogle} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route 
        path="/installation" 
        element={
          <InstallationGuide 
            onDownload={downloadExtension} 
            user={user}
            copyStatus={copyStatus}
            setCopyStatus={setCopyStatus}
          />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <div className="min-h-screen bg-bg text-ink font-sans relative" data-user-id={user?.uid}>
              <GridBackground isDarkMode={isDarkMode} />

              {/* Header */}
              <header className="sticky top-0 z-40 glass border-b border-border">
                <div className="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-12 h-12 bg-accent text-[#1A1A1A] flex items-center justify-center font-display text-2xl rounded-2xl transition-all duration-700 shadow-xl shadow-accent/20 group-hover:rotate-12 group-hover:scale-110">
                      <Logo className="w-7 h-7" primaryColor="#8B4513" secondaryColor="#5D4037" />
                    </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl font-display font-bold tracking-tight text-black dark:text-white group-hover:text-accent transition-colors">ArticulusDock</span>
                    <span className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 text-accent text-[7px] md:text-[8px] font-bold uppercase tracking-widest rounded-md">Beta</span>
                  </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-10">
                    <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-surface/50 rounded-2xl border border-border shadow-sm hover:border-accent transition-all group/id">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">ID:</span>
                      <code className="text-xs font-mono text-accent">{showUserId ? user?.uid : '••••••••••••'}</code>
                      <div className="flex items-center gap-2 ml-2">
                        <button 
                          onClick={() => setShowUserId(!showUserId)}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
                        >
                          {showUserId ? 'Hide' : 'Show'}
                        </button>
                        {showUserId && (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(user?.uid || '');
                              setCopyStatus(true);
                              setTimeout(() => setCopyStatus(false), 2000);
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-ink transition-colors"
                          >
                            {copyStatus ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Beta: Pro status hidden or shown as Beta Member */}
                    <div className="hidden sm:flex items-center gap-3 px-4 md:px-6 py-3 bg-accent/5 border border-accent/20 rounded-2xl text-accent">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Beta Access</span>
                    </div>
                    <button 
                      onClick={() => setShowExtensionInfo(!showExtensionInfo)}
                      className="hidden md:flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent border border-transparent hover:border-border rounded-2xl transition-all hover:bg-surface/50"
                    >
                      <Chrome className="w-5 h-5" />
                      Extension
                    </button>
                    <div className="h-8 w-[1px] bg-border hidden md:block" />
                    <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <img 
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} 
                    alt={user?.displayName || ''} 
                    className="w-10 h-10 rounded-2xl border border-border shadow-sm group-hover:border-accent transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold tracking-tight leading-none mb-1 group-hover:text-accent transition-colors">{user?.displayName}</div>
                  <div className="text-[10px] text-muted tracking-tight">{user?.email}</div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-3 text-muted hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-8 py-24 flex flex-col lg:flex-row gap-24 relative z-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-12">
          <div className="bento-card p-8 hover:bento-card-hover">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Collections</h2>
              <button 
                onClick={() => setShowAddGroupModal(true)}
                className="p-2 text-accent hover:bg-accent/10 rounded-xl transition-all hover:scale-110 active:scale-95"
                title="Create Group"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedGroupId(null)}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 text-sm font-semibold tracking-tight transition-all rounded-2xl border",
                  !selectedGroupId ? "bg-accent text-[#1A1A1A] border-accent shadow-lg shadow-accent/20" : "text-muted border-transparent hover:bg-bg hover:border-border hover:text-ink"
                )}
              >
                <div className="flex items-center gap-4">
                  <Layout className="w-5 h-5" />
                  All Articles
                </div>
                <span className={cn("text-xs font-bold", !selectedGroupId ? "text-[#1A1A1A]/60" : "text-muted/40")}>{articles.length}</span>
              </button>
              {groups.map(group => (
                <div key={group.id} className="relative group/item">
                  <button
                    onClick={() => setSelectedGroupId(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 text-sm font-semibold tracking-tight transition-all rounded-2xl border",
                      selectedGroupId === group.id ? "bg-accent text-[#1A1A1A] border-accent shadow-lg shadow-accent/20" : "text-muted border-transparent hover:bg-bg hover:border-border hover:text-ink"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Bookmark className="w-5 h-5" />
                      <span className="truncate max-w-[140px]">{group.name}</span>
                    </div>
                    <span className={cn("text-xs font-bold", selectedGroupId === group.id ? "text-[#1A1A1A]/60" : "text-muted/40")}>
                      {articles.filter(a => a.groupId === group.id).length}
                    </span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/item:opacity-100 text-muted hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card p-8 hover:bento-card-hover">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted mb-8 px-2">Insights</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-bg rounded-2xl border border-border group hover:border-accent transition-all duration-500">
                <div className="text-4xl font-display font-bold text-accent mb-2 group-hover:scale-105 transition-transform origin-left">{articles.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Total Saved</div>
              </div>
              <div className="p-6 bg-bg rounded-2xl border border-border group hover:border-accent transition-all duration-500">
                <div className="text-4xl font-display font-bold text-ink mb-2 group-hover:scale-105 transition-transform origin-left">{articles.filter(a => a.isRead).length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Read Articles</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted mb-8 px-2">Status</h2>
            <div className="grid grid-cols-1 gap-2">
              {(['unread', 'read', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 text-sm font-semibold tracking-tight rounded-2xl border transition-all",
                    filter === t ? "bg-bg border-accent text-accent shadow-sm" : "text-muted border-transparent hover:bg-bg hover:border-border hover:text-ink"
                  )}
                >
                  {t === 'unread' && <Circle className="w-5 h-5" />}
                  {t === 'read' && <CheckCircle className="w-5 h-5" />}
                  {t === 'all' && <Layout className="w-5 h-5" />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-16">
          {/* Welcome & Controls */}
          <div className="flex flex-col xl:flex-row gap-12 items-start xl:items-end justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-accent rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Personal Archive</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold tracking-tighter leading-[0.9]">
                Welcome back, <br />
                <span className="text-accent italic font-light">{user?.displayName?.split(' ')[0] || 'Reader'}</span>
              </h1>
              <div className="flex items-center gap-4 pt-4">
                <div className="px-6 py-3 bg-surface border border-border rounded-2xl shadow-sm flex items-center gap-3">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
              <div className="relative w-full sm:w-96 group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-surface border border-border rounded-[1.5rem] text-sm font-medium tracking-tight focus:outline-none focus:border-accent focus:shadow-xl focus:shadow-accent/5 transition-all"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-monopo w-full sm:w-auto flex items-center justify-center gap-4"
              >
                <Plus className="w-5 h-5" />
                Add Article
              </button>
            </div>
          </div>

          {/* Library Title */}
          <div className="flex items-center gap-6 pt-8">
            <h2 className="text-4xl font-display font-bold tracking-tight">
              {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : 'Library'}
            </h2>
            <div className="h-[1px] flex-1 bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">{filteredArticles.length} Articles</span>
          </div>

          {/* Article Grid */}
          <div className="relative min-h-[600px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full"
                />
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                  {filteredArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -8 }}
                      className="group relative bento-card p-10 flex flex-col h-full hover:bento-card-hover overflow-hidden"
                    >
                      {/* Interactive Background Glow */}
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 blur-3xl group-hover:bg-accent/15 transition-all duration-700 rounded-full" />
                      
                      {(article.thumbnail || true) && (
                        <div className="absolute inset-0 -z-10 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                          <img 
                            src={article.thumbnail || `https://picsum.photos/seed/${article.id}/800/600`} 
                            alt="" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-bg rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-[#1A1A1A] transition-all duration-500">
                            <BookOpen className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted/60">
                            {article.savedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          <button 
                            onClick={() => toggleRead(article)}
                            className={cn(
                              "p-3 rounded-xl transition-all hover:scale-110 active:scale-90",
                              article.isRead ? "bg-accent/10 text-accent" : "bg-bg text-muted hover:text-ink hover:bg-border"
                            )}
                            title={article.isRead ? "Mark Unread" : "Mark Read"}
                          >
                            {article.isRead ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => deleteArticle(article.id)}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-90"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-3xl font-display font-bold tracking-tight mb-6 line-clamp-2 group-hover:text-accent transition-colors duration-500 leading-[1.1] relative z-10">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted text-base line-clamp-3 mb-12 flex-grow leading-relaxed font-light relative z-10">
                        {article.excerpt || "No summary available."}
                      </p>

                      <div className="mt-auto pt-10 border-t border-border flex items-center justify-between relative z-10">
                        <div className="space-y-4">
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold uppercase tracking-widest text-muted/60 flex items-center gap-3 hover:text-accent transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            {new URL(article.url).hostname.replace('www.', '')}
                          </a>
                          <div className="relative inline-block">
                            <select 
                              value={article.groupId || ''} 
                              onChange={(e) => assignToGroup(article.id, e.target.value || null)}
                              className="appearance-none text-[10px] font-bold uppercase tracking-widest bg-bg border border-border rounded-xl px-4 py-2 text-muted/60 focus:ring-4 focus:ring-accent/5 focus:border-accent outline-none cursor-pointer hover:text-accent transition-all pr-10"
                            >
                              <option value="">No Collection</option>
                              {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted/30 pointer-events-none" />
                          </div>
                        </div>
                        <button 
                          onClick={() => { setReadingArticle(article); setIsReadMode(true); }}
                          className="w-16 h-16 bg-accent text-[#1A1A1A] rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-accent/20 hover:scale-110 active:scale-95 transition-all duration-500 group/btn overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                          <ArrowRight className="w-7 h-7 relative z-10" />
                        </button>
                      </div>

                      {/* Reading Time Badge */}
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                        <Clock className="w-4 h-4 text-accent/40" />
                        <span className="text-[8px] font-bold text-accent/40 uppercase vertical-rl">5 MIN</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-16 bg-surface rounded-[4rem] border border-border shadow-sm overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-accent/10" />
                <div className="w-32 h-32 bg-bg rounded-[3rem] border border-border flex items-center justify-center mb-12 animate-float shadow-sm relative group">
                  <div className="absolute inset-0 bg-accent/5 rounded-[3rem] scale-0 group-hover:scale-100 transition-transform duration-700" />
                  <BookOpen className="w-14 h-14 text-accent/30 group-hover:text-accent transition-colors duration-700" />
                </div>
                <h3 className="text-5xl lg:text-6xl font-display font-bold mb-8 tracking-tighter">
                  {searchQuery ? "No matches found" : "Your archive is empty"}
                </h3>
                <p className="text-muted max-w-md mb-16 font-light text-xl leading-relaxed">
                  {searchQuery 
                    ? `We couldn't find any articles matching "${searchQuery}". Try a different search term or filter.`
                    : "Start building your personal sanctuary by saving articles from across the web. Your future self will thank you."}
                </p>
                {!searchQuery && (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="btn-monopo px-12 py-6 text-base shadow-2xl shadow-accent/20"
                    >
                      <Plus className="w-6 h-6" />
                      Save Your First Article
                    </button>
                    <button 
                      onClick={loadSampleArticles}
                      className="btn-outline px-12 py-6 text-base"
                    >
                      Load Sample Articles
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-bg/98"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-xl bg-surface border border-border p-12 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)]"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-display font-bold tracking-tight">Add Article</h2>
                <button onClick={() => setShowAddModal(false)} className="p-3 text-muted hover:text-ink hover:bg-bg rounded-2xl transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleAddArticle} className="space-y-12">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Target URL</label>
                  <input 
                    type="url" 
                    required
                    placeholder="https://example.com/article"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-8 py-5 bg-bg border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isAdding}
                  className="btn-monopo w-full py-5 text-base"
                >
                  {isAdding ? <Clock className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {isAdding ? "Saving to Archive..." : "Save Article"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Group Modal */}
      <AnimatePresence>
        {showAddGroupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddGroupModal(false)}
              className="absolute inset-0 bg-bg/98"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-xl bg-surface border border-border p-12 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)]"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-display font-bold tracking-tight">New Collection</h2>
                <button onClick={() => setShowAddGroupModal(false)} className="p-3 text-muted hover:text-ink hover:bg-bg rounded-2xl transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleAddGroup} className="space-y-12">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Collection Name</label>
                  <input 
                    type="text" 
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Research, Design, Tech"
                    className="w-full px-8 py-5 bg-bg border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Description (Optional)</label>
                  <textarea 
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe the purpose of this collection..."
                    className="w-full px-8 py-5 bg-bg border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all h-32 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="btn-monopo w-full py-5 text-base"
                >
                  Create Collection
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Duplicate Article Modal */}
      <AnimatePresence>
        {showDuplicateModal && duplicateArticle && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDuplicateModal(false)}
              className="absolute inset-0 bg-bg/98 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-xl bg-surface border border-accent/20 p-12 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)]"
            >
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Zap className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-display font-bold tracking-tight">Duplicate Detected</h2>
                  <p className="text-muted leading-relaxed">
                    This article is already in your archive. Would you like to save another copy anyway?
                  </p>
                </div>
                
                <div className="w-full p-8 bg-bg border border-border rounded-3xl text-left space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted/60">Existing Article</div>
                  <div className="font-display font-bold text-ink line-clamp-1">{duplicateArticle.title}</div>
                  <div className="text-xs text-muted truncate">{duplicateArticle.url}</div>
                </div>

                <div className="flex flex-col w-full gap-4">
                  <button 
                    onClick={(e) => handleAddArticle(e as any, true)}
                    className="btn-monopo w-full py-5 text-base bg-accent text-[#1A1A1A]"
                  >
                    Yes, Save Anyway
                  </button>
                  <button 
                    onClick={() => setShowDuplicateModal(false)}
                    className="w-full py-5 text-base font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Read Mode View */}
      <AnimatePresence>
        {isReadMode && readingArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-bg overflow-y-auto selection:bg-accent selection:text-[#1A1A1A]"
          >
            <div className="max-w-4xl mx-auto px-6 py-32 relative">
              <button 
                onClick={() => setIsReadMode(false)}
                className="fixed top-12 left-12 w-14 h-14 bg-surface border border-border rounded-2xl flex items-center justify-center text-muted hover:text-accent hover:border-accent shadow-sm transition-all z-50"
              >
                <X className="w-7 h-7" />
              </button>

              <div className="space-y-24">
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-[2px] w-16 bg-accent rounded-full" />
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] text-muted">
                      <span>{new URL(readingArticle.url).hostname.replace('www.', '')}</span>
                      <span className="opacity-20">/</span>
                      <span>{readingArticle.savedAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] text-ink">
                    {readingArticle.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6">
                    <a 
                      href={readingArticle.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-monopo flex items-center gap-3 shadow-xl shadow-accent/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Original Source
                    </a>
                    <button 
                      onClick={() => toggleRead(readingArticle)}
                      className={cn(
                        "px-8 py-4 text-xs font-bold uppercase tracking-widest border rounded-2xl transition-all flex items-center gap-3",
                        readingArticle.isRead 
                          ? "bg-accent/5 border-accent text-accent" 
                          : "bg-surface border-border text-muted hover:text-ink hover:border-ink shadow-sm"
                      )}
                    >
                      {readingArticle.isRead ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      {readingArticle.isRead ? 'Finished' : 'Mark Read'}
                    </button>
                    
                    <button 
                      onClick={() => handleSummarize(readingArticle)}
                      disabled={isSummarizing}
                      className={cn(
                        "px-8 py-4 text-xs font-bold uppercase tracking-widest border rounded-2xl transition-all flex items-center gap-3",
                        "bg-accent text-bg shadow-xl shadow-accent/20"
                      )}
                    >
                      {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {isSummarizing ? 'Analyzing...' : 'AI Summary'}
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-border" />

                {articleSummary && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/5 border border-accent/20 p-12 rounded-[3rem] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Sparkles className="w-12 h-12 text-accent" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-3">
                      <Sparkles className="w-4 h-4" />
                      AI Insights
                    </h4>
                    <div className="prose-invert text-ink/80 leading-relaxed font-light text-lg">
                      <div className="space-y-4">
                        {articleSummary.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="read-mode-content prose-invert">
                  {readingArticle.excerpt && (
                    <p className="text-3xl text-muted leading-relaxed font-light italic mb-24 border-l-4 border-accent/30 pl-12">
                      {readingArticle.excerpt}
                    </p>
                  )}
                  
                  <div className="space-y-16 text-muted/90 leading-[1.8] text-xl font-light">
                    {readingArticle.content ? (
                      <div className="markdown-body">
                        <Markdown>{readingArticle.content}</Markdown>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <p>
                          Read mode provides a clean, distraction-free environment for your saved articles. 
                          ArticulusDock focuses on the content that matters, stripping away ads, popups, and clutter.
                        </p>
                        <div className="p-8 bg-surface border border-border rounded-3xl">
                          <p className="text-sm text-muted">
                            <span className="font-bold text-accent uppercase tracking-widest block mb-2">Note:</span>
                            This article was saved without full content extraction. This can happen if the article 
                            is behind a paywall, requires login, or if the AI extraction failed for this specific URL.
                          </p>
                        </div>
                        <p>
                          You can always view the full version by clicking <strong>"Original Source"</strong> above.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-[1px] bg-border pt-24" />
                
                <div className="flex justify-between items-center text-muted text-[10px] font-bold uppercase tracking-[0.5em]">
                  <div className="flex items-center gap-4 text-black dark:text-white">
                    <div className="w-8 h-8 bg-accent text-[#1A1A1A] flex items-center justify-center font-display text-sm rounded-lg">
                      <Logo className="w-5 h-5" primaryColor="#8B4513" secondaryColor="#5D4037" />
                    </div>
                    ArticulusDock Archive
                  </div>
                  <div className="flex items-center gap-8">
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExtensionInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExtensionInfo(false)}
              className="absolute inset-0 bg-bg/98"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-surface border border-border p-12 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Chrome className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-4xl font-display font-bold tracking-tight uppercase">Extension</h2>
                </div>
                <button onClick={() => setShowExtensionInfo(false)} className="p-3 text-muted hover:text-ink hover:bg-bg rounded-2xl transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-display font-bold uppercase flex items-center gap-3">
                      <Zap className="w-5 h-5 text-accent" />
                      Developer Preview
                    </h3>
                    <p className="text-muted text-sm leading-relaxed font-light">
                      This ZIP package is for testing during development. In the final <strong>Chrome Web Store</strong> version, installation and authentication are 100% automatic.
                    </p>
                    <button 
                      onClick={downloadExtension}
                      className="btn-monopo w-full py-5 text-base shadow-xl shadow-accent/20"
                    >
                      <Download className="w-5 h-5" />
                      Download Dev Package
                    </button>
                  </div>

                  <div className="space-y-6 pt-12 border-t border-border">
                    <h3 className="text-xl font-display font-bold uppercase">Your User ID</h3>
                    <div className="flex items-center gap-4 p-6 bg-bg border border-border rounded-2xl">
                      <code className="flex-1 text-[10px] font-mono text-accent overflow-x-auto">{user?.uid}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(user?.uid || '');
                          setCopyStatus(true);
                          setTimeout(() => setCopyStatus(false), 2000);
                        }}
                        className="px-6 py-3 bg-ink text-bg text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-accent hover:text-[#1A1A1A] transition-all shadow-sm"
                      >
                        {copyStatus ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted/60 font-medium leading-relaxed">
                      This ID is required to link the extension to your account. It's already pre-configured in the download.
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="space-y-8">
                    <h3 className="text-xl font-display font-bold uppercase">Installation</h3>
                    <div className="space-y-8">
                      {[
                        { step: '01', text: 'Extract the ZIP file to a folder on your computer.' },
                        { step: '02', text: 'Open chrome://extensions in your browser.' },
                        { step: '03', text: 'Enable "Developer mode" in the top right corner.' },
                        { step: '04', text: 'Click "Load unpacked" and select the extracted folder.' }
                      ].map((item) => (
                        <div key={item.step} className="flex gap-6 items-start group">
                          <span className="text-accent font-display text-3xl font-bold leading-none group-hover:scale-110 transition-transform">{item.step}</span>
                          <p className="text-muted text-sm leading-relaxed font-light pt-1 text-glow">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-[1800px] mx-auto px-6 py-20 border-t border-border mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-ink text-bg flex items-center justify-center font-display text-2xl group-hover:bg-accent group-hover:text-[#1A1A1A] transition-all duration-500">
              <Logo className="w-6 h-6" primaryColor="#8B4513" secondaryColor="#5D4037" />
            </div>
            <span className="font-display text-2xl uppercase tracking-tighter text-black dark:text-white transition-colors duration-500">ArticulusDock</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">© 2026 ArticulusDock Archive. All rights reserved.</p>
          <div className="flex items-center gap-12">
            <button onClick={() => navigate('/privacy')} className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors">Terms</button>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors">Help</a>
          </div>
        </div>
      </footer>
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}
