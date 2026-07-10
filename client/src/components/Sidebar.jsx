import { motion, AnimatePresence } from 'framer-motion'

const MENU_ITEMS = [
  { icon: '🌍', label: '지도', path: '/' },
  { icon: '📷', label: '전체 갤러리', path: '/gallery' },
  { icon: '🧳', label: '여행', path: '/trips' },
  { icon: '⭐', label: '즐겨찾기', path: '/favorites' },
  { icon: '👤', label: '프로필', path: '/profile' },
  { icon: '⚙', label: '설정', path: '/settings' },
]

export default function Sidebar({ isOpen, onClose, onNavigate }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 딤 처리 - 클릭하면 닫힘 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* 사이드바 본체 */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
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
                  onClick={() => {
                    onNavigate(item.path)
                    onClose()
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80
                             hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}