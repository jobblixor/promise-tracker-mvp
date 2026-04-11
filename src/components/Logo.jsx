export default function Logo({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="48" height="48" rx="6" fill="#0a0f1a" />
      <rect x="8" y="11" width="28" height="28" rx="6" stroke="white" strokeWidth="4" fill="none" />
      <path d="M14 26l7 7L38 13" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
