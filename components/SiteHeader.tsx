'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const mobileOpen = openPathname === pathname;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPathname(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#e4e4e7] bg-white/95 backdrop-blur-sm">
      <div
        className={cn(
          'mx-auto flex h-14 items-center justify-between gap-8 px-4 sm:px-6',
          siteConfig.layout.maxWidthClass
        )}
      >
        {/* Zone 1: Single-line brand wordmark */}
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight text-[#111113] transition-colors hover:text-[#ea580c] whitespace-nowrap shrink-0"
        >
          {siteConfig.identity.handle}
        </Link>

        {/* Zone 2: Primary single-line navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6"
        >
          {siteConfig.navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'text-[#111113]'
                    : 'text-[#52525b] hover:text-[#111113]'
                )}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#ea580c]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single primary external action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={siteConfig.identity.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 border border-[#111113] bg-[#111113] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#ea580c] hover:bg-[#ea580c] rounded-sm whitespace-nowrap shrink-0"
          >
            <span>GitHub</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() =>
              setOpenPathname((prev) => (prev === pathname ? null : pathname))
            }
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#e4e4e7] bg-white text-[#111113] transition-colors hover:border-[#a3a2a5] md:hidden rounded-sm shrink-0"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          className="border-t border-[#e4e4e7] bg-[#f7f7f8] px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col divide-y divide-[#e4e4e7]">
            {siteConfig.navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpenPathname(null)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[44px] items-center justify-between py-2 text-sm font-medium transition-colors',
                      active ? 'text-[#ea580c]' : 'text-[#111113]'
                    )}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="font-mono text-xs text-[#ea580c]">
                        Active
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <a
                href={siteConfig.identity.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center justify-between py-2 text-sm font-semibold text-[#111113]"
              >
                <span>GitHub Profile</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
