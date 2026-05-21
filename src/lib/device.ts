/**
 * 簡易裝置指紋（給「限 2 裝置」用）
 *
 * 注意：學生清 localStorage 可以重置，這只是 MVP；
 * 進階版可接 @fingerprintjs/fingerprintjs（付費版才有 visitorId 穩定）。
 */

const KEY = "vn_device_fp";
const LABEL_KEY = "vn_device_label";

export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = `${crypto.randomUUID()}-${Date.now()}`;
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

export function getDeviceLabel(): string {
  if (typeof window === "undefined") return "";
  let label = localStorage.getItem(LABEL_KEY);
  if (label) return label;

  // 自動產生：根據 user agent 推測裝置類型
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isMac = /Mac OS/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const browser = /Chrome/i.test(ua)
    ? "Chrome"
    : /Safari/i.test(ua)
      ? "Safari"
      : /Firefox/i.test(ua)
        ? "Firefox"
        : "Browser";

  const platform = isMobile
    ? "手機"
    : isMac
      ? "Mac"
      : isWindows
        ? "Windows"
        : "電腦";

  label = `${platform} · ${browser}`;
  localStorage.setItem(LABEL_KEY, label);
  return label;
}

export function setDeviceLabel(label: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LABEL_KEY, label.slice(0, 80));
}
