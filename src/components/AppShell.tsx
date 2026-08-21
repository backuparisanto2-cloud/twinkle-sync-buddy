import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  LayoutDashboard,
  DoorClosed,
  Wrench,
  FileBarChart,
  Wallet,
  Coins,
  Map,
  PieChart,
  Users,
  Settings,


  Menu,
  Type,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TEXT_SIZES, useTextSize } from "@/lib/text-size";

const nav = [
  { to: "/", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/dashboard", label: "Dashboard", icon: PieChart },
  { to: "/kamar", label: "Kamar", icon: DoorClosed },
  { to: "/denah", label: "Denah", icon: Map },
  { to: "/fasilitas", label: "Fasilitas Utama", icon: Wrench },
  { to: "/tenant", label: "Tenant & Pembayaran", icon: Users },
  { to: "/pendapatan", label: "Pendapatan", icon: Coins },
  { to: "/pengeluaran", label: "Pengeluaran", icon: Wallet },
  { to: "/jurnal", label: "Jurnal Umum", icon: BookOpen },
  { to: "/kelola", label: "Kelola Data", icon: Settings },

  { to: "/laporan", label: "Laporan", icon: FileBarChart },


] as const;


function TextSizeControl({ compact = false }: { compact?: boolean }) {
  const { size, setSize } = useTextSize();
  return (
    <div className={compact ? "flex gap-1" : "space-y-2"}>
      {compact ? null : (
        <p className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          <Type className="h-3.5 w-3.5" /> Ukuran teks
        </p>
      )}
      <div className="flex gap-2">
        {TEXT_SIZES.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSize(option.key)}
            aria-pressed={option.key === size}
            title={option.title}
            className={`min-w-11 rounded-md border px-3 py-2 text-sm transition-colors ${
              option.key === size
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="border-b border-gold-line bg-card/90 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/app-icon-192.png"
              alt="Logo Lavin Kost"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-md border border-gold-line"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-base leading-tight font-semibold tracking-tight sm:text-lg">
                Lavin Kost Purwokerto
              </p>
              <p className="truncate text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                Inventaris
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden gap-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden md:block">
              <TextSizeControl compact />
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Buka menu"
                  className="h-11 w-11 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[17rem] p-0">
                <SheetHeader className="border-b border-gold-line px-5 py-4 text-left">
                  <SheetTitle className="font-display text-lg">Menu</SheetTitle>
                  <SheetDescription className="text-xs">
                    Inventaris Lavin Kost Purwokerto
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col px-2 py-3">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: item.to === "/" }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <div className="mt-2 border-t border-gold-line px-5 py-4">
                  <TextSizeControl />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <div className="mt-3 h-px w-24 bg-primary" />
          {subtitle ? <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
