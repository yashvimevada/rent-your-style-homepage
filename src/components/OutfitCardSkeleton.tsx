const OutfitCardSkeleton = () => {
  return (
    <div className="rounded-2xl overflow-hidden card-gradient border border-border shadow-card">
      {/* Image skeleton */}
      <div className="relative aspect-[3/4] skeleton" />

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="h-6 skeleton w-3/4" />

        {/* Price */}
        <div className="h-6 skeleton w-1/3" />

        {/* Sizes */}
        <div className="space-y-2">
          <div className="h-4 skeleton w-1/4" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-12 skeleton" />
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="h-10 skeleton w-full" />
      </div>
    </div>
  );
};

export default OutfitCardSkeleton;
