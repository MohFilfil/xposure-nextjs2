/**
 * اختبار دخان بلا أي تبعية: يشغّل next start، ثم يطلب كل مسار ويتحقّق من
 * رمز 200 ومن وجود علامات نصية تدلّ على أن الصفحة صُيّرت فعلاً لا أنها قشرة خطأ.
 * التشغيل: npm run build && npm run smoke
 */
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";

const PORT = Number(process.env.SMOKE_PORT ?? 3131);
const BASE = `http://127.0.0.1:${PORT}`;

/** كل مسار وعلامات يجب أن تظهر في HTML المُصيَّر. */
const GUARD = "جارٍ التحقق من الجلسة";

/**
 * كل مسار وعلامات يجب أن تظهر في HTML المُصيَّر.
 * مسارات التطبيق خلف حارس الجلسة، فالمتوقّع من الخادم هو لوح الانتظار؛
 * التحقق من محتواها الفعلي يتم بمتصفّح حقيقي بجلسة مزروعة.
 */
const ROUTES = [
  ["/", ["Xposure", "/login"]],
  ["/login", ["Xposure"]],
  ["/dashboard", [GUARD]],
  ["/changes", [GUARD]],
  ["/changes/CH-2401", [GUARD]],
  ["/tasks", [GUARD]],
  ["/audit", [GUARD]],
  ["/settings", [GUARD]]
];

/**
 * يُشغّل next مباشرة بـ node بلا قشرة وسيطة: قتل القشرة على ويندوز يترك الخادم
 * حيّاً، فيردّ التشغيل التالي بنسخة بناء قديمة فيظهر النجاح كاذباً.
 */
const NEXT_BIN = resolve("node_modules/next/dist/bin/next");
const server = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"]
});

let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

async function waitForReady(timeoutMs = 60_000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const r = await fetch(BASE, { redirect: "manual" });
      if (r.status > 0) return true;
    } catch {
      /* الخادم لم يفتح المنفذ بعد */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

function stop(code) {
  /* شجرة العمليات كاملة: next يولّد عملية ابنة تبقى تستمع لو قُتِل الأب وحده */
  if (process.platform === "win32" && server.pid) {
    spawnSync("taskkill", ["/F", "/T", "/PID", String(server.pid)], { stdio: "ignore" });
  }
  server.kill("SIGKILL");
  process.exit(code);
}

const ready = await waitForReady();
if (!ready) {
  console.error("لم يبدأ الخادم في الوقت المحدد:\n" + serverLog);
  stop(1);
}

let failed = 0;
for (const [path, markers] of ROUTES) {
  let line = `  ${path.padEnd(22)} `;
  try {
    const res = await fetch(BASE + path, { redirect: "manual" });
    const html = await res.text();
    const ok = res.status === 200 || res.status === 307 || res.status === 308;
    const missing = res.status === 200 ? markers.filter((m) => !html.includes(m)) : [];
    if (!ok || missing.length > 0) {
      failed++;
      line += `✗ ${res.status}${missing.length ? ` — علامات ناقصة: ${missing.join(", ")}` : ""}`;
    } else {
      line += `✓ ${res.status}${res.status === 200 ? ` · ${(html.length / 1024).toFixed(0)}KB` : ` → ${res.headers.get("location") ?? ""}`}`;
    }
  } catch (err) {
    failed++;
    line += `✗ ${err.message}`;
  }
  console.log(line);
}

console.log(failed === 0 ? "\nاختبار الدخان: كل المسارات سليمة." : `\nاختبار الدخان: ${failed} مسار/مسارات فاشلة.`);
stop(failed === 0 ? 0 : 1);
