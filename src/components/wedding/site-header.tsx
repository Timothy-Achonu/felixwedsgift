"use client";

import { Camera, Heart, Menu, Settings2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/#story", label: "Our story" },
  { href: "/#details", label: "Details" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/gallery", label: "Gallery" },
];

export function SiteHeader({
  showAdminShortcut = false,
}: {
  showAdminShortcut?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="text-wedding-cream absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 text-sm font-semibold uppercase"
            aria-label="Felix and Gift, home"
          >
            <Heart aria-hidden="true" className="size-4 fill-current" />
            <span>F &amp; G</span>
          </Link>
          {showAdminShortcut ? (
            <Link
              href="/admin"
              className="focus-ring text-wedding-cream/72 hover:text-wedding-blue grid size-9 place-items-center transition-colors"
              aria-label="Open wedding studio"
            >
              <Settings2 aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
        </div>

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
        className={`bg-wedding-cream text-wedding-navy [&_a]:border-wedding-navy/[14%] absolute top-[4.7rem] right-5 left-5 grid overflow-hidden opacity-0 transition-[max-height,opacity,transform] [transition-duration:250ms,180ms,250ms] [transition-timing-function:ease] [&_a]:border-b [&_a]:px-[1.15rem] [&_a]:py-4 [&_a]:text-[0.85rem] [&_a]:font-bold [&_a]:text-inherit [&_a]:no-underline ${
          menuOpen
            ? "border-wedding-navy/20 max-h-96 translate-y-0 border opacity-100"
            : "max-h-0 -translate-y-3"
        }`}
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
        <Link
          href="/#share"
          onClick={closeMenu}
          className="bg-wedding-blue inline-flex items-center gap-[0.6rem] border-b-0!"
        >
          <Camera aria-hidden="true" className="size-4" />
          Share photos
        </Link>
      </nav>
    </header>
  );
}
