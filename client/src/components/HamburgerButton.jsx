export default function HamburgerButton({ onClick, isOpen }) {
  return (
    <button
      onClick={onClick}
      aria-label="메뉴 열기"
      className={`fixed top-5 left-5 z-[60] w-10 h-10 rounded-full
                  flex items-center justify-center
                  bg-white/10 backdrop-blur-md border border-white/10
                  text-white text-lg hover:bg-white/20 transition-all
                  ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      ☰
    </button>
  )
}