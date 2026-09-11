"use client";

import { Camera, Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/#story", label: "Our story" },
  { href: "/#details", label: "Details" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/gallery", label: "Gallery" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="text-wedding-cream absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 text-sm font-semibold uppercase"
          aria-label="Felix and Gift, home"
        >
          <Heart aria-hidden="true" className="size-4 fill-current" />
          <span>F &amp; G</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link focus-ring"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/#share" className="button button-cream focus-ring">
            <Camera aria-hidden="true" className="size-4" />
            Share photos
          </Link>
        </nav>

        <button
          type="button"
          className="focus-ring grid size-11 place-items-center md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
        <Link href="/#share" onClick={closeMenu} className="mobile-menu-share">
          <Camera aria-hidden="true" className="size-4" />
          Share photos
        </Link>
      </nav>
    </header>
  );
}
