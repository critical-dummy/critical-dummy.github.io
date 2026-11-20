import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="max-w-lg space-y-4 border border-[#e4e4e7] bg-[#f7f7f8] p-6 rounded-sm">
      <h1 className="text-xl font-bold text-[#111113]">Page not found</h1>
      <p className="text-sm text-[#52525b]">
        The requested route does not exist in this workspace.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[40px] items-center border border-[#111113] bg-[#111113] px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[#ea580c] hover:bg-[#ea580c] rounded-sm"
      >
        Return Home
      </Link>
    </section>
  );
}
