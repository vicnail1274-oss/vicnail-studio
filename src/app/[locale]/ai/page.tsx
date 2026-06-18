import { redirect } from "next/navigation";

// AI 探索 section 已關閉，一律導向首頁
export default async function AiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
