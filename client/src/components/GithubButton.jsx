export default function GithubButton() {
  return (
    <a
      href="https://github.com/chunkyoungmin/memory_earth"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub 저장소 보기"
      className="fixed bottom-8 right-24 z-50 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577 0-.285-.01-1.04-.016-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.762-1.605-2.665-.303-5.467-1.333-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.045.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.432.372.816 1.103.816 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.192.694.8.576C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
      </svg>
    </a>
  )
}