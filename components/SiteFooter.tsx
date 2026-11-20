import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#a3a2a5]/50 bg-[#f7f7f8]">
      <div
        className={cn(
          'mx-auto flex flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6',
          siteConfig.layout.maxWidthClass
        )}
      >
        <div className="space-y-1">
          <p className="font-mono text-xs font-medium text-[#111113]">
            {siteConfig.identity.handle}
          </p>
          <p className="text-xs text-[#52525b]">
            Public repository and profile data served via the GitHub REST API.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#52525b]"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[#111113] whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.identity.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#111113] transition-colors hover:text-[#ea580c] whitespace-nowrap"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
