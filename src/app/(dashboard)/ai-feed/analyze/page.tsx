"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Heart, Repeat2, MessageCircle, Eye, ExternalLink,
  Sparkles, Loader2, Zap, FileText, Share2, Copy, Check,
} from "lucide-react";

interface Post {
  id: string;
  content: string;
  post_url: string;
  posted_at: string;
  likes: number;
  reposts: number;
  replies: number;
  views: number;
  media_urls: string | null;
  seo_article: string | null;
  quick_news: string | null;
  expert: { handle: string; display_name: string; category: string; avatar_url?: string };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

// ==========================================
// GENERATE CONTENT FORMATS
// ==========================================

function generateQuickNews(p: Post): string {
  const name = p.expert.display_name;
  const handle = p.expert.handle;
  const c = p.content;
  const short = c.length > 120 ? c.substring(0, 117) + "..." : c;

  const hashtags = [];
  const lc = c.toLowerCase();
  if (lc.includes("ai") || lc.includes("artificial")) hashtags.push("#AI");
  if (lc.includes("programming") || lc.includes("code")) hashtags.push("#VibeCoding");
  if (lc.includes("llm") || lc.includes("model")) hashtags.push("#LLM");
  if (lc.includes("open source")) hashtags.push("#OpenSource");
  if (lc.includes("agent")) hashtags.push("#AIAgents");
  if (lc.includes("openai") || lc.includes("gpt")) hashtags.push("#OpenAI");
  if (lc.includes("anthropic") || lc.includes("claude")) hashtags.push("#Anthropic");
  if (lc.includes("google") || lc.includes("gemini")) hashtags.push("#Google");
  if (lc.includes("robot")) hashtags.push("#Robotics");
  if (hashtags.length === 0) hashtags.push("#AI", "#Tech");
  if (!hashtags.includes("#AI2026")) hashtags.push("#AI2026");

  return `🔥 ${name}: "${short}"

${fmt(p.likes)} likes · ${fmt(p.views)} views trên X.com

${hashtags.slice(0, 5).join(" ")}

📎 ${p.post_url || ""}`;
}

function generateSEO(p: Post): string {
  const name = p.expert.display_name;
  const handle = p.expert.handle;
  const c = p.content;
  const lc = c.toLowerCase();

  const cat = p.expert.category === "researcher" ? "nhà nghiên cứu AI hàng đầu thế giới"
    : p.expert.category === "founder" ? "nhà sáng lập một trong những công ty AI lớn nhất"
    : "chuyên gia AI có ảnh hưởng toàn cầu";

  // Generate keyword from content
  let keyword = "tin tức AI 2026";
  if (lc.includes("programming") && lc.includes("english")) keyword = "vibe coding là gì";
  else if (lc.includes("wiki") || lc.includes("memory")) keyword = "cá nhân hoá AI";
  else if (lc.includes("math") || lc.includes("reason")) keyword = "AI có biết suy luận không";
  else if (lc.includes("open source")) keyword = "AI mã nguồn mở 2026";
  else if (lc.includes("agent")) keyword = "AI agents 2026";
  else if (lc.includes("safety") || lc.includes("risk")) keyword = "an toàn AI";
  else if (lc.includes("regulation") || lc.includes("policy")) keyword = "chính sách AI 2026";

  const shortContent = c.length > 80 ? c.substring(0, 77) + "..." : c;
  const slug = keyword.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return `---
title: "${name}: ${shortContent} — Phân Tích Chi Tiết"
meta_description: "${name} (${handle}) chia sẻ góc nhìn gây chấn động cộng đồng AI: ${fmt(p.likes)} likes, ${fmt(p.views)} views. Phân tích đầy đủ cho người mới."
slug: ${slug}-${name.toLowerCase().replace(/\s+/g, "-")}
keyword: ${keyword}
---

# ${name}: "${shortContent}" — Điều Này Có Ý Nghĩa Gì Với Bạn?

## Tóm tắt nhanh

**${name}** (${handle}) — ${cat} — vừa đăng một bài viết thu hút **${p.likes.toLocaleString()} lượt thích** và **${p.views.toLocaleString()} lượt xem** trên X.com. Đây là con số thuộc hàng cao nhất trong cộng đồng AI toàn cầu.

> "${c}"

---

## ${name} là ai?

${name} là ${cat}. Trong giới AI, khi ${name} nói điều gì, hàng triệu người lắng nghe. Bài viết này đạt tỉ lệ tương tác **${(p.views > 0 ? (p.likes + p.reposts + p.replies) / p.views * 100 : 0).toFixed(2)}%** — cao hơn nhiều so với trung bình 0.5-2% của X.com.

---

## Phân tích nội dung

${c.length > 200 ? `Bài viết dài ${c.length} ký tự, chứa nhiều ý tưởng đáng chú ý. Dưới đây là phân tích từng phần:

### Ý chính
${c.split(/[.!?]\s+/).slice(0, 3).map(s => `- ${s.trim()}`).join("\n")}

### Tại sao điều này quan trọng?
Trong bối cảnh AI đang phát triển cực nhanh năm 2026 — GPT-5.4, Gemini 3.1 Ultra, Claude đều ra mắt tháng 3/2026, MCP Protocol đạt 97 triệu lượt cài đặt — mỗi ý kiến từ các chuyên gia hàng đầu đều mang trọng lượng đặc biệt.` : `Dù ngắn gọn chỉ ${c.length} ký tự, bài viết tạo được sức cộng hưởng lớn. Trong giới công nghệ, những câu ngắn nhất thường mạnh nhất.

### Bối cảnh
Bài viết xuất hiện giữa lúc AI đang thay đổi nhanh chóng: GPT-5.4, Gemini 3.1 Ultra ra mắt tháng 3/2026, Hugging Face đạt 13 triệu người dùng, và Trung Quốc vượt Mỹ về AI downloads.`}

---

## Giải thích đơn giản cho người mới

Nếu bạn chưa biết nhiều về AI, đây là những điều cần hiểu:

**Trí tuệ nhân tạo (AI)** là công nghệ cho phép máy tính "học" và thực hiện các nhiệm vụ giống con người — từ viết văn, phân tích dữ liệu, đến tạo hình ảnh và video.

**Tại sao bạn nên quan tâm?** Vì AI đang thay đổi mọi ngành nghề. Người hiểu AI sớm sẽ có lợi thế lớn — không cần là lập trình viên, chỉ cần hiểu cách dùng.

${name} là một trong những người định hình tương lai AI. Khi ${name.split(" ")[0]} chia sẻ điều gì, đó thường là tín hiệu về hướng đi của cả ngành.

---

## Số liệu engagement

| Chỉ số | Giá trị |
|--------|---------|
| Lượt xem | ${p.views.toLocaleString()} |
| Lượt thích | ${p.likes.toLocaleString()} |
| Chia sẻ | ${p.reposts.toLocaleString()} |
| Bình luận | ${p.replies.toLocaleString()} |
| Tỉ lệ tương tác | ${(p.views > 0 ? (p.likes + p.reposts + p.replies) / p.views * 100 : 0).toFixed(2)}% |

---

## Đọc thêm

- [LINK:tong-hop-tin-ai-2026] — Tổng hợp tin tức AI mới nhất
- [LINK:chuyen-gia-ai-can-theo-doi] — 30 chuyên gia AI bạn nên follow
- [LINK:hub-knowledge-base] — Cập nhật AI hàng ngày bằng tiếng Việt

---

*Nguồn: X.com/${handle?.replace("@", "")} · Scraped ${new Date().toLocaleDateString("vi-VN")} · Hub Knowledge Base*`;
}

function generateAnalysis(p: Post): string {
  const name = p.expert.display_name;
  const handle = p.expert.handle;
  const c = p.content;
  const views = p.views;
  const likes = p.likes;
  const isViral = views > 1_000_000;

  const cat = p.expert.category === "researcher"
    ? "nhà nghiên cứu hàng đầu, đóng góp nhiều công trình quan trọng cho AI."
    : p.expert.category === "founder"
    ? "nhà sáng lập một trong những công ty AI lớn nhất thế giới."
    : "kỹ sư/chuyên gia có tiếng nói trong cộng đồng AI toàn cầu.";

  return `## Ai nói điều này?

**${name}** (${handle}) — ${cat}

Khi ${name} đăng bài trên X.com, nó không chỉ là một dòng trạng thái — nó là tín hiệu cho cả ngành.

## Nội dung chính

> "${c}"

${c.length < 100 ? `Ngắn gọn ${c.length} ký tự nhưng sức cộng hưởng cực lớn.` : `Bài viết ${c.length} ký tự với nhiều ý tưởng sâu sắc.`}

## Tại sao bài này quan trọng?

- **${views.toLocaleString()} lượt xem** — ${isViral ? "MEGA VIRAL" : "ảnh hưởng lớn"}
- **${likes.toLocaleString()} lượt thích** — đồng tình cực cao
- **${p.reposts.toLocaleString()} chia sẻ** — lan truyền mạnh
- **Bối cảnh**: GPT-5.4, Gemini 3.1, Claude ra mắt tháng 3/2026. MCP 97M installs. HF 13M users.

## Kết luận

${isViral ? `Với ${(views / 1000000).toFixed(1)}M views, ý tưởng này đã chạm đúng nerve — sự thật mà hàng triệu người cảm nhận.` : `Góc nhìn từ chuyên gia hàng đầu, đang được trao đổi sôi nổi.`}`;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get("id");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analysis" | "quicknews" | "seo">("analysis");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const res = await api.aiExperts.post(postId);
        setPost(res.data || null);
      } catch { setPost(null); }
      setLoading(false);
    })();
  }, [postId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="size-8 animate-spin text-cyan-500" /></div>;
  if (!post) return <div className="text-center text-slate-400 py-20">Không tìm thấy bài viết</div>;

  const engRate = post.views > 0 ? ((post.likes + post.reposts + post.replies) / post.views * 100).toFixed(2) : "0";

  const contents = {
    analysis: generateAnalysis(post),
    quicknews: post.quick_news || generateQuickNews(post),
    seo: post.seo_article || generateSEO(post),
  };

  const tabs = [
    { key: "analysis" as const, label: "Phân tích", icon: Sparkles, color: "from-violet-600/20 to-violet-800/20 border-violet-500/30" },
    { key: "quicknews" as const, label: "Tin nhanh", icon: Zap, color: "from-amber-600/20 to-amber-800/20 border-amber-500/30" },
    { key: "seo" as const, label: "Bài SEO", icon: FileText, color: "from-emerald-600/20 to-emerald-800/20 border-emerald-500/30" },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(contents[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100" onClick={() => router.back()}>
        <ArrowLeft className="size-4 mr-1" /> Quay lại AI Feed
      </Button>

      {/* Bài gốc */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
            <Badge className="bg-sky-600/20 text-sky-400 border-sky-600/30 text-[10px]">X.com</Badge>
            <span>Bài gốc</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            {post.expert.avatar_url ? (
              <img src={post.expert.avatar_url} alt="" className="size-12 rounded-full object-cover" />
            ) : (
              <div className="size-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {post.expert.display_name?.[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{post.expert.display_name}</span>
                <span className="text-sm text-slate-500">{post.expert.handle}</span>
              </div>
              <span className="text-xs text-slate-500">{post.expert.category} · {new Date(post.posted_at).toLocaleDateString("vi-VN")}</span>
            </div>
            {post.post_url && <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-slate-500 hover:text-cyan-400"><ExternalLink className="size-5" /></a>}
          </div>
          <p className="text-base text-slate-100 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          {post.media_urls && (() => { try { const imgs: string[] = JSON.parse(post.media_urls); return imgs.length ? <div className={`mt-4 grid gap-2 ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>{imgs.slice(0, 4).map((url, i) => <img key={i} src={url} alt="" className="rounded-xl w-full object-cover max-h-[400px] bg-slate-800" />)}</div> : null; } catch { return null; } })()}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><MessageCircle className="size-4" /> {fmt(post.replies)}</span>
            <span className="flex items-center gap-1.5"><Repeat2 className="size-4" /> {fmt(post.reposts)}</span>
            <span className="flex items-center gap-1.5 text-pink-400"><Heart className="size-4" /> {fmt(post.likes)}</span>
            <span className="flex items-center gap-1.5 text-cyan-400"><Eye className="size-4" /> {fmt(post.views)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Lượt xem", value: fmt(post.views), color: "text-cyan-400" },
          { label: "Lượt thích", value: fmt(post.likes), color: "text-pink-400" },
          { label: "Tương tác", value: engRate + "%", color: "text-emerald-400" },
          { label: "Mức viral", value: post.views > 1000000 ? "Mega Viral" : post.views > 100000 ? "Viral" : "Đang lên", color: "text-amber-400" },
        ].map((s, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === t.key
                ? `bg-gradient-to-r ${t.color} text-slate-100`
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
        <button onClick={handleCopy} className="ml-auto flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-sm transition-all">
          {copied ? <><Check className="size-3.5 text-emerald-400" /> Đã copy</> : <><Copy className="size-3.5" /> Copy</>}
        </button>
      </div>

      {/* Content Output */}
      <Card className={`bg-gradient-to-br from-slate-900 to-slate-950 ${
        activeTab === "analysis" ? "border-violet-800/30" :
        activeTab === "quicknews" ? "border-amber-800/30" :
        "border-emerald-800/30"
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {activeTab === "analysis" && <><Sparkles className="size-5 text-violet-400" /><h2 className="text-lg font-bold text-slate-100">Phân tích chi tiết</h2><Badge className="bg-violet-600/20 text-violet-400 border-violet-600/30 text-[10px]">Deep Analysis</Badge></>}
            {activeTab === "quicknews" && <><Zap className="size-5 text-amber-400" /><h2 className="text-lg font-bold text-slate-100">Tin nhanh</h2><Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 text-[10px]">X.com · Threads</Badge></>}
            {activeTab === "seo" && <><FileText className="size-5 text-emerald-400" /><h2 className="text-lg font-bold text-slate-100">Bài SEO</h2><Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-[10px]">Blog · Website</Badge></>}
          </div>

          <article className="prose prose-invert prose-sm max-w-none">
            {contents[activeTab].split("\n").map((line, i) => {
              if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-slate-100 mt-6 mb-3">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-violet-300 mt-5 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-cyan-300 mt-4 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-violet-500 pl-4 italic text-slate-300 my-3">{line.slice(2)}</blockquote>;
              if (line.startsWith("- ")) return <li key={i} className="text-slate-200 ml-4 mb-1 list-disc">{line.slice(2)}</li>;
              if (line.startsWith("| ")) return <p key={i} className="text-slate-300 font-mono text-xs mb-0.5">{line}</p>;
              if (line.startsWith("---")) return <hr key={i} className="border-slate-800 my-4" />;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="text-slate-200 leading-relaxed mb-2">{line}</p>;
            })}
          </article>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="size-8 animate-spin text-cyan-500" /></div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
