"use client";
import Link from "next/link";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/data";
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        A little discovery. A lot of possibility.{" "}
        <span>
          Meet your next everyday favorite <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="site-header">
        <div className="container header-main">
          <Link href="/" className="brand" aria-label="OofCourse home">
            <span className="brand-mark">
              o<span>o</span>f<span className="brand-dot">✳</span>
            </span>
            OofCourse<span className="brand-period">.</span>
          </Link>
          <form action="/search" className="search-bar" role="search">
            <Search size={19} />
            <input
              type="search"
              name="q"
              aria-label="Search deals"
              placeholder="What’s on your wishlist?"
            />
            <button aria-label="Submit search">
              <ArrowUpRight size={19} />
            </button>
          </form>
          <Link href="/deals" className="header-link">
            Explore deals <ArrowUpRight size={16} />
          </Link>
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
        <nav className="container desktop-nav" aria-label="Main navigation">
          <Link href="/deals" className="nav-all">
            All deals
          </Link>
          {categories.map((c) => (
            <Link href={`/category/${c.slug}`} key={c.slug}>
              {c.name}
            </Link>
          ))}
          <span className="nav-note">
            <span className="tiny-dot" /> Good finds, thoughtfully picked.
          </span>
        </nav>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
            onClick={() => setOpen(false)}
          >
            <Link href="/deals">All deals</Link>
            {categories.map((c) => (
              <Link href={`/category/${c.slug}`} key={c.slug}>
                {c.name}
              </Link>
            ))}
            <Link href="/about">About us</Link>
          </nav>
        )}
      </header>
    </>
  );
}
