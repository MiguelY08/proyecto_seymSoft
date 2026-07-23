function NotificationSkeleton() {
  return (
    <div className="space-y-3 px-4 py-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationSkeleton;

