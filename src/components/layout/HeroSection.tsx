'use client';

import { Plane, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section
      className="relative bg-neutral-900 text-white overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Geometric grid pattern - Aviation/Technical aesthetic */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Diagonal accent lines - Flight path inspired */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
            <line x1="0" y1="300" x2="400" y2="0" stroke="white" strokeWidth="0.5" />
            <line x1="100" y1="300" x2="400" y2="50" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="300" x2="400" y2="100" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Red accent corner */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-600/20 to-transparent" />
      </div>

      {/* Large plane silhouette */}
      <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.04]" aria-hidden="true">
        <Plane className="w-[500px] h-[500px] transform -rotate-12" strokeWidth={0.3} />
      </div>

      <div className="sem-container relative">
        <div className="py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - Main content */}
            <div className="animate-sem-fade-in">
              {/* Document reference - Analysezeitraum */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-red-600" aria-hidden="true" />
                <span className="sem-doc-number">{t('period')}</span>
              </div>

              <h2
                id="hero-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-[1.1] tracking-tight"
              >
                <span className="text-white">{t('title1')}</span>
                <span className="block text-red-500">{t('title2')}</span>
              </h2>

              <p className="text-lg text-neutral-400 leading-relaxed max-w-xl">
                {t('description')}
              </p>
            </div>

            {/* Right column - Metric cards (nur 3 Kacheln) */}
            <div className="grid grid-cols-3 gap-4 animate-sem-fade-in" style={{ animationDelay: '150ms' }}>
              {/* INAD Card */}
              <div className="bg-white/5 border border-white/10 p-5 group hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <Plane className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">{t('cards.analysis')}</span>
                </div>
                <p className="text-2xl font-bold mb-1">{t('cards.inad')}</p>
                <p className="text-xs text-neutral-500">{t('cards.inadLabel')}</p>
              </div>

              {/* PAX Card */}
              <div className="bg-white/5 border border-white/10 p-5 group hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <Users className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">{t('cards.data')}</span>
                </div>
                <p className="text-2xl font-bold mb-1">{t('cards.pax')}</p>
                <p className="text-xs text-neutral-500">{t('cards.paxLabel')}</p>
              </div>

              {/* Status Card */}
              <div className="relative bg-red-600 p-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/50 rounded-full -translate-y-10 translate-x-10" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <TrendingUp className="w-5 h-5 text-red-200" />
                    <span className="text-xs font-bold tracking-wider text-red-200 uppercase">{t('cards.status')}</span>
                  </div>
                  <p className="text-2xl font-bold mb-1">{t('cards.active')}</p>
                  <p className="text-xs text-red-200">{t('cards.ready')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border with document-like detail */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
        <div className="h-1 bg-red-600" />
      </div>
    </section>
  );
}
