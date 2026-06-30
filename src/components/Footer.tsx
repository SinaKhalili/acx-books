import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="site-footer mt-24 px-4 pb-14 pt-10 text-[var(--ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 max-w-md text-sm leading-relaxed">
          An unofficial simulation of the Astral Codex Ten 2026 Book Review
          Contest. Scores are produced by an AI judge and are not affiliated with
          or endorsed by ACX.
        </p>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/about" className="no-underline hover:text-[var(--ink)]">
            Method
          </Link>
          <a
            href="https://www.astralcodexten.com/"
            target="_blank"
            rel="noreferrer"
            className="no-underline hover:text-[var(--ink)]"
          >
            ACX
          </a>
        </div>
      </div>
      <p className="kicker page-wrap mt-6 text-center sm:text-left">
        Judged by Claude · Built with TanStack Start
      </p>
    </footer>
  )
}
