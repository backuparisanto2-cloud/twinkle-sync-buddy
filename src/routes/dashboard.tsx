import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Boxes, DoorClosed, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  allRoomItemsQuery,
  formatRupiah,
  roomsQuery,
  sharedItemsQuery,
} from "@/lib/inventory";
import { expensesQuery } from "@/lib/expenses";
import { incomesQuery, otherIncomesQuery } from "@/lib/income";
import {
  JOURNAL_PRESETS,
  buildJournal,
  journalByMonth,
  journalTotals,
  presetRange,
  type JournalPreset,
} from "@/lib/journal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Ringkasan — Lavin Kost Purwokerto" },
      {
        name: "description",
        content:
          "Dashboard ringkasan kamar, barang inventaris, serta grafik pendapatan dan pengeluaran Lavin Kost Purwokerto dengan filter periode.",
      },
      { property: "og:title", content: "Dashboard Ringkasan — Lavin Kost Purwokerto" },
      {
        property: "og:description",
        content: "Grafik arus kas, kondisi barang, dan okupansi kamar dengan filter periode.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

function monthLabel(month: string) {
  const [y, m] = month.split("-");
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(
    new Date(Number(y), Number(m) - 1, 1),
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof Boxes;
  tone?: "danger" | "success";
}) {
  return (
    <div className="gold-card rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        <Icon
          className={`h-4 w-4 ${
            tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : "text-gold"
          }`}
        />
      </div>
      <p
        className={`mt-2 font-display text-2xl font-semibold ${
          tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="gold-card rounded-xl p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 h-64 w-full">{children}</div>
    </div>
  );
}

function DashboardPage() {
  const rooms = useQuery(roomsQuery);
  const roomItems = useQuery(allRoomItemsQuery);
  const sharedItems = useQuery(sharedItemsQuery);
  const incomes = useQuery(incomesQuery);
  const otherIncomes = useQuery(otherIncomesQuery);
  const expenses = useQuery(expensesQuery);

  const [preset, setPreset] = useState<JournalPreset>("tahun-ini");
  const [custom, setCustom] = useState({ from: "", to: "" });

  const range = preset === "kustom" ? custom : presetRange(preset);

  const entries = useMemo(
    () => buildJournal(incomes.data ?? [], otherIncomes.data ?? [], expenses.data ?? []),
    [incomes.data, otherIncomes.data, expenses.data],
  );

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) => (!range.from || e.date >= range.from) && (!range.to || e.date <= range.to),
      ),
    [entries, range.from, range.to],
  );

  const totals = journalTotals(filtered);
  const monthly = useMemo(
    () =>
      journalByMonth(filtered)
        .slice(0, 12)
        .reverse()
        .map((m) => ({ ...m, label: monthLabel(m.month) })),
    [filtered],
  );

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) {
      if (e.kind !== "Pengeluaran") continue;
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const semuaBarang = [...(roomItems.data ?? []), ...(sharedItems.data ?? [])];
  const kondisi = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of semuaBarang) map.set(item.condition, (map.get(item.condition) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [roomItems.data, sharedItems.data]);

  const perLantai = useMemo(() => {
    const map = new Map<number, number>();
    for (const room of rooms.data ?? []) map.set(room.floor, (map.get(room.floor) ?? 0) + 1);
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([floor, jumlah]) => ({ label: `Lantai ${floor}`, jumlah }));
  }, [rooms.data]);

  const totalUnit = semuaBarang.reduce((a, i) => a + i.quantity, 0);
  const perluPerhatian = semuaBarang.filter((i) => i.condition !== "Baik").length;

  return (
    <AppShell
      title="Dashboard Ringkasan"
      subtitle="Ringkasan kamar, barang, dan arus kas dengan filter periode."
    >
      <div data-tour="dashboard-period" className="gold-card flex flex-wrap items-end gap-2 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {JOURNAL_PRESETS.map((p) => (
            <Button
              key={p.key}
              type="button"
              size="sm"
              variant={preset === p.key ? "default" : "outline"}
              onClick={() => setPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {preset === "kustom" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={custom.from}
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
              className="h-9 w-40"
              aria-label="Dari tanggal"
            />
            <span className="text-xs text-muted-foreground">s/d</span>
            <Input
              type="date"
              value={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
              className="h-9 w-40"
              aria-label="Sampai tanggal"
            />
          </div>
        ) : null}
      </div>

      <div data-tour="dashboard-stats" className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Kamar" value={rooms.data?.length ?? "—"} icon={DoorClosed} />
        <Stat label="Total Unit Barang" value={totalUnit || "—"} icon={Boxes} />
        <Stat label="Perlu Perhatian" value={perluPerhatian} icon={AlertTriangle} tone="danger" />
        <Stat
          label="Saldo Periode"
          value={formatRupiah(totals.saldo) ?? "—"}
          icon={Wallet}
          tone={totals.saldo < 0 ? "danger" : "success"}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat
          label="Pendapatan Periode"
          value={formatRupiah(totals.pendapatan) ?? "—"}
          icon={TrendingUp}
          tone="success"
        />
        <Stat
          label="Pengeluaran Periode"
          value={formatRupiah(totals.pengeluaran) ?? "—"}
          icon={TrendingDown}
          tone="danger"
        />
      </div>

      <div data-tour="dashboard-charts" className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Pendapatan vs Pengeluaran per Bulan">
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi pada periode ini.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`} />
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Legend />
                <Bar dataKey="pendapatan" name="Pendapatan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Tren Saldo Bulanan">
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data saldo.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`} />
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Pengeluaran per Kategori">
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada pengeluaran pada periode ini.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Kondisi Barang">
          {kondisi.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada barang tercatat.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={kondisi} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} label>
                  {kondisi.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} item`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Jumlah Kamar per Lantai">
          {perLantai.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada kamar.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perLantai}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={40} />
                <Tooltip />
                <Bar dataKey="jumlah" name="Kamar" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </AppShell>
  );
}
