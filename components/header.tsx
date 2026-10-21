"use client";
import Link from "next/link";
import { Search, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SavedNav } from "./saved";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="OofCourse home">
      <span className="brand-oo" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>
        OofCourse<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
const links = [
  ["/deals", "Deals"],
  ["/categories", "Categories"],
  ["/stores", "Stores"],
  ["/guides", "Buying Guides"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <div className="announcement">
        <span>
          Great Deals? <strong>Of Course!</strong>
        </span>
        <span>Thoughtful finds for every kind of family.</span>
        <Link href="/about">
          Get to know us <ArrowRight size={12} />
        </Link>
      </div>
      <header className="site-header">
        <div className="container header-main">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <form className="header-search" action="/search" role="search">
            <input
              type="search"
              name="q"
              aria-label="Search deals"
              placeholder="Search everyday finds"
              maxLength={200}
            />
            <button aria-label="Submit search">
              <Search size={19} />
            </button>
          </form>
          <Link
            href="/search"
            className="compact-search"
            aria-label="Search all finds"
          >
            <Search size={20} />
          </Link>
          <SavedNav />
          <button
            className="mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav container"
            aria-label="Mobile navigation"
          >
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
                <ArrowRight size={16} />
              </Link>
            ))}
            <Link href="/saved" onClick={() => setOpen(false)}>
              Saved finds <ArrowRight size={16} />
            </Link>
            <form action="/search" onSubmit={() => setOpen(false)}>
              <label htmlFor="mobile-search" className="sr-only">
                Search finds
              </label>
              <input
                id="mobile-search"
                name="q"
                placeholder="What are you looking for?"
              />
              <button aria-label="Search mobile menu">
                <Search size={20} />
              </button>
            </form>
          </nav>
        )}
      </header>
      <div className="trust-line">
        <ShieldCheck size={14} />
        <span>
          Independent discovery. Clear information. A little more everyday good.
        </span>
      </div>
    </>
  );
}
