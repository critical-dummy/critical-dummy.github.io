'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import type { ContactChannel } from '@/config/site';

interface ContactLinksProps {
  channels: ContactChannel[];
}

export function ContactLinks({ channels }: ContactLinksProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, value: string) => {
    let copied = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    }
  };

  return (
    <ul className="divide-y divide-[#e4e4e7] border border-[#e4e4e7] bg-white rounded-sm">
      {channels.map((channel) => {
        const isCopied = copiedId === channel.id;

        return (
          <li
            key={channel.id}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-[#52525b]">
                {channel.label}
              </p>
              <p className="font-mono text-sm font-semibold text-[#111113] break-all">
                {channel.value}
              </p>
              <p className="text-xs text-[#52525b]">{channel.note}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {channel.copyable && (
                <button
                  type="button"
                  onClick={() => handleCopy(channel.id, channel.value)}
                  aria-label={`Copy ${channel.label} value`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 border border-[#e4e4e7] bg-[#f7f7f8] px-3 py-2 text-xs font-medium text-[#111113] transition-colors hover:border-[#a3a2a5] rounded-sm whitespace-nowrap shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check
                        className="h-3.5 w-3.5 text-[#ea580c]"
                        aria-hidden="true"
                      />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}

              {channel.href && (
                <a
                  href={channel.href}
                  target={channel.external ? '_blank' : undefined}
                  rel={channel.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-[40px] items-center gap-1.5 border border-[#111113] bg-[#111113] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#ea580c] hover:bg-[#ea580c] rounded-sm whitespace-nowrap shrink-0"
                >
                  <span>Open</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
