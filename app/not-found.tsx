import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid h-dvh place-items-center text-center">
      <div className="space-y-3">
        <h1 className="text-lg font-semibold">This view doesn’t exist</h1>
        <Link href="/" className="text-brand underline">Back to the map</Link>
      </div>
    </main>
  );
}
