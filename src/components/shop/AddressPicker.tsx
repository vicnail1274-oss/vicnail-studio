"use client";

import { useMemo, useState, useEffect } from "react";
import { TW_COUNTIES } from "@/lib/tw-zipcodes";

interface Props {
  value: string; // 完整地址，"100台北市中正區..."
  onChange: (fullAddress: string) => void;
  className?: string;
}

/**
 * 台灣地址輸入器：縣市下拉 → 鄉鎮市區下拉 → 詳細地址
 * 結果組合成 "{zip}{county}{district}{detail}" 寫回 value
 */
export function AddressPicker({ value, onChange, className }: Props) {
  const [county, setCounty] = useState("");
  const [district, setDistrict] = useState("");
  const [detail, setDetail] = useState("");

  // 從 value 初始化一次（僅初始 mount）
  useEffect(() => {
    if (!value) return;
    // 嘗試解析既有值：郵遞區號(3) + 縣市 + 區 + 其他
    const zipMatch = value.match(/^(\d{3})/);
    const rest = zipMatch ? value.slice(3) : value;
    for (const c of TW_COUNTIES) {
      if (rest.startsWith(c.name)) {
        setCounty(c.name);
        const afterCounty = rest.slice(c.name.length);
        for (const d of c.districts) {
          if (afterCounty.startsWith(d.name)) {
            setDistrict(d.name);
            setDetail(afterCounty.slice(d.name.length));
            return;
          }
        }
        setDetail(afterCounty);
        return;
      }
    }
    setDetail(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCounty = useMemo(
    () => TW_COUNTIES.find((c) => c.name === county),
    [county]
  );
  const selectedZip = useMemo(
    () => selectedCounty?.districts.find((d) => d.name === district)?.zip ?? "",
    [selectedCounty, district]
  );

  function update(nextCounty: string, nextDistrict: string, nextDetail: string) {
    setCounty(nextCounty);
    setDistrict(nextDistrict);
    setDetail(nextDetail);
    const zip = TW_COUNTIES.find((c) => c.name === nextCounty)?.districts.find(
      (d) => d.name === nextDistrict
    )?.zip ?? "";
    const composed = nextCounty && nextDistrict
      ? `${zip}${nextCounty}${nextDistrict}${nextDetail}`
      : nextDetail;
    onChange(composed);
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <select
          value={county}
          onChange={(e) => update(e.target.value, "", detail)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-nail-gold/30 focus:border-nail-gold"
        >
          <option value="">選擇縣市</option>
          {TW_COUNTIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => update(county, e.target.value, detail)}
          disabled={!selectedCounty}
          className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-nail-gold/30 focus:border-nail-gold disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">選擇鄉鎮市區</option>
          {selectedCounty?.districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <input
          type="text"
          value={detail}
          onChange={(e) => update(county, district, e.target.value)}
          placeholder="路名、巷弄、門牌號碼"
          className="w-full px-4 py-2.5 pl-20 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30 focus:border-nail-gold"
        />
        {selectedZip && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-0.5 rounded">
            {selectedZip}
          </span>
        )}
      </div>
    </div>
  );
}
