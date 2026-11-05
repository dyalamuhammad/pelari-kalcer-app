export function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-70 blur-[60px]"
        style={{ background: "#0A84FF" }}
      />
      <div
        className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full opacity-50 blur-[60px]"
        style={{ background: "#64D2FF" }}
      />
    </div>
  );
}