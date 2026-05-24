export default function LoginLoading() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-6 w-6 rounded-full border-2 border-stone-200 border-t-stone-600 animate-spin" />
    </div>
  );
}
