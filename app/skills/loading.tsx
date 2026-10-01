export default function SkillsLoading() {
  return (
    <div className="container mx-auto px-4 py-10" aria-busy="true">
      <div className="mb-8 max-w-2xl">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton mt-3 h-4 w-full max-w-md" />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="skeleton h-10 w-full sm:max-w-md" />
        <div className="skeleton h-10 w-full sm:w-44" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-box border border-base-300">
            <div className="border-b border-base-300 bg-base-200 px-4 py-3">
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
            <div className="border-t border-base-300 px-4 py-3">
              <div className="skeleton h-4 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
