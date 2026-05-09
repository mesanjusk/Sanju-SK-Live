const LoadingSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-48 rounded-lg bg-gray-200" />
        <div className="mt-4 h-4 w-2/3 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-full rounded bg-gray-100" />
        <div className="mt-4 h-10 w-full rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
