export function Spinner() {
  return (
    <div className="grid h-dvh place-items-center" role="status" aria-label="Loading">
      <div className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
  );
}
