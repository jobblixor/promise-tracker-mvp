export default function Logo({ size = 36, className = '' }) {
  return (
    <img
      src="/logo.jpeg"
      alt="Promise Tracker"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}
