export default function Logo({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#0a0f1a" />
      <path d="M14 25l7 7L35 16" stroke="#22c55e" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
