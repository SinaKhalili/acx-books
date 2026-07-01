import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-[var(--ink)] no-underline"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--accent-wash)] font-display text-sm font-bold text-[var(--claret)]">
              A
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              ACX Book Review Contest
            </span>
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 pb-1 text-sm sm:order-none sm:ml-6 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
            activeOptions={{ exact: true }}
          >
            Standings
          </Link>
          <Link
            to="/analysis"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Analysis
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Method
          </Link>
          <a
            href="https://www.astralcodexten.com/"
            className="nav-link"
            target="_blank"
            rel="noreferrer"
          >
            ACX
          </a>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
