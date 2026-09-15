export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
