"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";

/** 画面下部に固定するタブバー。スマホでの操作を前提にしている */

const TABS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/gacha", label: "ガチャ", icon: "🎁" },
  { href: "/collection", label: "図鑑", icon: "📖" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const unlocked = useGameStore((s) => s.certificateUnlocked);

  // 認定証タブはコンプリート後だけ現れる（未達成のうちは存在自体を伏せる）
  const tabs = [
    ...TABS,
    ...(hydrated && unlocked
      ? [{ href: "/certificate", label: "認定証", icon: "🏅" } as const]
      : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="メインメニュー"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                  active ? "text-gold" : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {tab.icon}
                </span>
                <span className="font-medium">{tab.label}</span>
                <span
                  aria-hidden
                  className={`mt-0.5 h-0.5 w-6 rounded-full transition-colors ${
                    active ? "bg-gold" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
