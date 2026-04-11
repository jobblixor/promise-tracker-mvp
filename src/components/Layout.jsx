import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  // { to: '/promises', label: 'Promises', icon: PromisesIcon },
  { to: '/team', label: 'Team', icon: TeamIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function PromisesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const showUpgrade = plan !== 'pro';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-bg-card via-bg-card to-bg-primary/80 border-r border-border/60">
        {/* Brand */}
        <div className="p-6 pb-5">
          <h1 className="text-lg font-extrabold text-text-primary flex items-center gap-3 tracking-tight">
            <span className="w-9 h-9 bg-accent rounded-[10px] flex items-center justify-center text-white text-sm font-black shadow-[0_0_20px_rgba(34,197,94,0.25)] transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(34,197,94,0.4)]">
              P
            </span>
            Promise Tracker
          </h1>
          {user?.businessName && (
            <p className="text-[11px] text-text-muted mt-2.5 pl-12 font-medium tracking-wide uppercase">{user.businessName}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-text-primary bg-white/[0.07]'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
                }`}
              >
                {/* Active indicator */}
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 ${
                  isActive ? 'h-5 bg-accent shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'h-0 bg-transparent'
                }`} />
                <span className={`transition-transform duration-200 ${isActive ? 'text-accent' : 'group-hover:scale-110'}`}>
                  <item.icon />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Upgrade CTA */}
        {showUpgrade && (
          <div className="px-3 mb-2">
            <NavLink
              to="/pricing"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-semibold text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Upgrade
            </NavLink>
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 border-t border-border/40" />

        {/* User */}
        <div className="p-4 pt-4">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-[10px] hover:bg-white/[0.03] transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold ring-1 ring-accent/20">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-secondary truncate">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[11px] text-text-muted truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-[11px] font-medium text-text-muted hover:text-red-400 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-red-500/5"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-card/90 backdrop-blur-xl border-t border-border/60 flex justify-around py-2.5 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200 ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                <item.icon />
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && <span className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-accent" />}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
