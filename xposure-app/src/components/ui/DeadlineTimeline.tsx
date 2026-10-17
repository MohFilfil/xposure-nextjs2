"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Priority, RegChange } from "@/lib/types";
import { daysUntil, cx, TODAY } from "@/lib/utils";
import { PRIORITY_LABEL, PRIORITY_RANK, PRIORITY_VAR } from "@/lib/vocab";

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** تسمية «شهر سنة» من تاريخ ISO — الأرقام غربية كبقية النظام. */
function monthLabel(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * الخط الزمني لمواعيد السريان.
 * النقر على عنقود يفتح قائمة التغييرات على موجته لا على أولويته: العنقود تاريخ،
 * والعمل الذي يفتحه هو «أنجِز ما يستحق في هذا اليوم». الفكرة التي يكشفها ولا يكشفها الجدول: التواريخ
 * ليست موزّعة، بل متكدّسة — سبعة تغييرات تستحق في اليوم نفسه. من يقرأ الجدول صفاً
 * صفاً يرى اثني عشر موعداً مستقلاً؛ ومن يرى الخط يعرف أن أمامه ثلاث موجات عمل.
 *
 * المحور يمضي من اليمين (اليوم) إلى اليسار (أبعد موعد) كاتجاه القراءة في الواجهة.
 * كل عنقود قابل للنقر ويفتح قائمة التغييرات مصفّاة على أولويته الغالبة.
 */
export function DeadlineTimeline({ changes }: { changes: RegChange[] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const { clusters, months, span } = useMemo(() => {
    const byDate = new Map<string, RegChange[]>();
    for (const c of changes) {
      const list = byDate.get(c.effective) ?? [];
      list.push(c);
      byDate.set(c.effective, list);
    }

    const dates = Array.from(byDate.keys()).sort();
    const last = dates.length ? new Date(`${dates[dates.length - 1]}T00:00:00`) : TODAY;
    /* هامش شهر بعد آخر موعد حتى لا يلتصق آخر عنقود بحافة المحور */
    const end = new Date(last.getFullYear(), last.getMonth() + 1, 1);
    const start = startOfMonth(TODAY);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));

    const pos = (iso: string) => {
      const t = new Date(`${iso}T00:00:00`).getTime();
      return Math.min(100, Math.max(0, ((t - start.getTime()) / 86_400_000 / totalDays) * 100));
    };

    const clusters = dates.map((iso) => {
      const items = byDate.get(iso)!;
      /* الأولوية الغالبة للعنقود هي أشدّها — لا متوسطها: موعد فيه بند حرج هو موعد حرج */
      const top = items.slice().sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])[0].priority;
      return { iso, items, top, at: pos(iso), days: daysUntil(iso) };
    });

    /**
     * علامة لكل شهر، لكن التسمية لا تُكتب إلا على واحدة من كل `step` شهور —
     * ثمانية أسماء شهور عربية متجاورة على محور واحد تتداخل قبل أن تُقرأ.
     */
    const ticks: Array<{ label: string; at: number; named: boolean }> = [];
    const cursor = new Date(start);
    let n = 0;
    while (cursor < end) {
      ticks.push({ label: monthLabel(cursor), at: pos(cursor.toISOString().slice(0, 10)), named: false });
      cursor.setMonth(cursor.getMonth() + 1);
      n += 1;
    }
    const step = n <= 6 ? 1 : n <= 12 ? 2 : 3;
    ticks.forEach((t, i) => {
      t.named = i % step === 0;
    });
    const months = ticks;

    return { clusters, months, span: `${monthLabel(start)} — ${monthLabel(last)}` };
  }, [changes]);

  if (clusters.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-body text-body-sm text-ink-muted">{span}</span>
        <span className="font-body text-caption text-ink-subtle">حجم الدائرة = عدد التغييرات المستحقة في اليوم نفسه</span>
      </div>

      {/**
       * الحاوية معكوسة أفقياً: نسبة 0% تقع على اليمين حيث يبدأ الزمن في واجهة RTL.
       * المحور عند 40px، وأكبر عنقود نصف قطره 22px، فتبدأ التسميات عند 74px —
       * وإلا جلست أسماء الشهور تحت الدوائر مباشرة وتعذّرت قراءتها.
       */}
      <div className="relative h-[104px] w-full" dir="ltr" style={{ transform: "scaleX(-1)" }}>
        <div className="absolute inset-x-0 top-[40px] h-px bg-border" aria-hidden />

        {months.map((m) => (
          <div key={m.label} className="absolute top-0" style={{ left: `${m.at}%` }} aria-hidden>
            <span className="absolute top-[66px] h-[6px] w-px -translate-x-1/2 bg-border" />
            {m.named && (
              <span
                className="absolute top-[76px] -translate-x-1/2 whitespace-nowrap font-body text-caption text-ink-subtle"
                style={{ transform: "scaleX(-1) translateX(50%)" }}
              >
                {m.label}
              </span>
            )}
          </div>
        ))}

        {/* علامة «اليوم»: المرجع الذي تُقاس منه كل الأيام المتبقية */}
        <div className="absolute top-[26px] h-[28px] w-[2px] bg-brand" style={{ left: "0%" }} aria-hidden />
        <span
          className="absolute top-[8px] whitespace-nowrap font-body text-caption font-bold text-brand"
          style={{ left: "0%", transform: "scaleX(-1) translateX(-6px)" }}
          aria-hidden
        >
          اليوم
        </span>

        {clusters.map((c) => {
          const size = Math.min(44, 20 + c.items.length * 3.5);
          const open = hovered === c.iso;
          return (
            <button
              key={c.iso}
              type="button"
              onMouseEnter={() => setHovered(c.iso)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(c.iso)}
              onBlur={() => setHovered(null)}
              onClick={() => router.push(`/changes?wave=${c.iso}`)}
              aria-label={`${c.iso}: ${c.items.length} تغييراً، أعلاها ${PRIORITY_LABEL[c.top]}، خلال ${c.days} يوماً`}
              className="absolute top-[40px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-raised transition-transform duration-2 ease-spring hover:scale-110 focus-visible:scale-110"
              style={{ left: `${c.at}%`, width: size, height: size, background: PRIORITY_VAR[c.top] }}
            >
              <span
                className="flex h-full w-full items-center justify-center font-body text-caption font-bold"
                style={{ transform: "scaleX(-1)", color: c.top === "watch" ? "var(--ink)" : "var(--surface)" }}
                aria-hidden
              >
                {c.items.length}
              </span>

              {open && (
                <span
                  role="tooltip"
                  className="glass absolute bottom-[calc(100%+10px)] left-1/2 z-dropdown w-[220px] -translate-x-1/2 rounded-md border p-3 text-start shadow-lg"
                  style={{ transform: "scaleX(-1) translateX(50%)" }}
                >
                  <span className="block font-mono text-caption text-ink-muted" dir="ltr">
                    {c.iso}
                  </span>
                  <span className="mt-1 block font-body text-body-sm font-bold text-ink">
                    {c.items.length} تغييراً تستحق في اليوم نفسه
                  </span>
                  <span className="mt-1 block font-body text-caption text-ink-muted">
                    خلال {c.days} يوماً · أعلاها {PRIORITY_LABEL[c.top]}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Legend changes={changes} />
    </div>
  );
}

function Legend({ changes }: { changes: RegChange[] }) {
  const order: Priority[] = ["critical", "strategic", "quick", "watch"];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline pt-3">
      {order.map((p) => {
        const n = changes.filter((c) => c.priority === p).length;
        if (n === 0) return null;
        return (
          <span key={p} className={cx("flex items-center gap-2 font-body text-caption text-ink-muted")}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIORITY_VAR[p] }} aria-hidden />
            {PRIORITY_LABEL[p]}
            <span className="font-mono text-ink-subtle">{n}</span>
          </span>
        );
      })}
    </div>
  );
}
