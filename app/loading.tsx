export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading page content"
      className="space-y-6"
    >
      <div className="space-y-2 border-b border-[#e4e4e7] pb-5">
        <div className="h-7 w-40 animate-pulse bg-[#f1f1f3] rounded-sm" />
        <div className="h-4 w-80 max-w-full animate-pulse bg-[#f7f7f8] rounded-sm" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="h-32 animate-pulse border border-[#e4e4e7] bg-[#f7f7f8] rounded-sm"
          />
        ))}
      </div>
    </div>
  );
}
