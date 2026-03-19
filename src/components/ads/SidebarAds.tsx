"use client";

import { AdSlot } from "./AdSlot";

export function SidebarAds({ dark = false }: { dark?: boolean }) {
  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[300px] shrink-0">
      <AdSlot size="rectangle" slotId="sidebar-top" dark={dark} />
      <div className="sticky top-24 flex flex-col gap-6">
        <AdSlot size="rectangle" slotId="sidebar-mid" dark={dark} />
        <AdSlot size="large-rectangle" slotId="sidebar-sticky" dark={dark} />
      </div>
    </aside>
  );
}
