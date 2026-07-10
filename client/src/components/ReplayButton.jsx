export default function ReplayButton({ onClick, disabled, isReplaying }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="fixed top-5 right-5 z-50 px-4 py-2 rounded-full
                 bg-white/10 backdrop-blur-md border border-white/10
                 text-white text-sm hover:bg-white/20 transition-all
                 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {isReplaying ? '⏸ Replay 중...' : '▶ Memory Replay'}
    </button>
  )
}
