const MENU_ITEMS = [
  { icon: '🌍', label: '지도', path: '/' },
  { icon: '📷', label: '전체 갤러리', path: '/gallery' },
  { icon: '🧳', label: '여행', path: '/trips' },
  { icon: '⭐', label: '즐겨찾기', path: '/favorites' },
  { icon: '👤', label: '프로필', path: '/profile' },
  { icon: '⚙', label: '설정', path: '/settings' },
]

export default function Sidebar({ onNavigate }) {
  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 bg-[#161618]/90 backdrop-blur-xl
                 border-r border-white/10 z-50 flex flex-col py-6"
    >
      <div className="px-6 pb-6 mb-2 border-b border-white/10">
        <span className="text-white text-lg font-semibold tracking-tight">
          🌍 Earth Memory
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80
                       hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}