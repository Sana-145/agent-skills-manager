"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 px-1 py-2 text-sm font-medium ${
        active
          ? "border-primary text-base-content"
          : "border-transparent text-base-content/70 hover:text-base-content"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Mobile menu */}
        <div className="dropdown md:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content z-10 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2"
          >
            <li><Link href="/skills">Browse skills</Link></li>
            {isAuthenticated && (
              <li><Link href="/dashboard">My skills</Link></li>
            )}
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/robot.svg" alt="Agent Skills" className="h-10 w-10" />
          <span className="text-lg font-bold tracking-tight"> Agent Skills</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-5 md:flex" aria-label="Main">
          <NavLink href="/skills">Browse skills</NavLink>
          {isAuthenticated && <NavLink href="/dashboard">My skills</NavLink>}
          <NavLink href="/about">About</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" aria-label="Loading account" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard/skills/new"
                className="btn btn-primary btn-sm hidden sm:inline-flex"
              >
                New skill
              </Link>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Account menu"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral text-sm font-semibold text-neutral-content">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content z-10 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2"
                >
                  <li className="menu-title">{user?.name}</li>
                  <li><Link href="/dashboard">My skills</Link></li>
                  <li><Link href="/dashboard/skills/new">New skill</Link></li>
                  <li><button onClick={logout}>Log out</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
