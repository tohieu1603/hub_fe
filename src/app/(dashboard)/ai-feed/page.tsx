"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Repeat2,
  MessageCircle,
  Eye,
  ExternalLink,
  Search,
  Newspaper,
  Users,
  TrendingUp,
  BookOpen,
  GitFork,
  Star,
  ArrowUp,
  FileText,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  expert: { handle: string; display_name: string; category: string; avatar_url?: string };
}

interface Paper {
  id: string;
  title: string;
  authors: string;
  description: string;
  upvotes: number;
  arxiv_url: string;
  github_stars: number;
}

interface Repo {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  stars_week: number;
  url: string;
}

const categoryColors: Record<string, string> = {
  researcher: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  founder: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  engineer: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  journalist: "bg-amber-600/20 text-amber-400 border-amber-600/30",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function AiFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "feed" | "papers" | "repos" | "experts">("all");
  const [sortBy, setSortBy] = useState<"views" | "likes" | "recent">("views");
  const [sourceFilter, setSourceFilter] = useState<"" | "x.com" | "huggingface" | "github">("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const [postsRes, papersRes, reposRes, expertsRes] = await Promise.all([
        api.aiExperts.posts(100),
        api.aiExperts.papers(),
        api.aiExperts.repos(),
        api.aiExperts.list(),
      ]);
      setPosts(postsRes.data || []);
      setPapers(papersRes.data || []);
      setRepos(reposRes.data || []);
      setExperts(expertsRes.data || []);
      setLoading(false);
    })();
  }, []);

  const filteredPosts = posts
    .filter((p) => !search || p.content.toLowerCase().includes(search.toLowerCase()) || p.expert.display_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "views" ? b.views - a.views : sortBy === "likes" ? b.likes - a.likes : new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());

  const filteredPapers = papers.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));

  const filteredRepos = repos.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()));

  const filteredExperts = experts.filter((e: any) => e.total_posts_scraped > 0 && (!search || e.display_name?.toLowerCase().includes(search.toLowerCase())));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Newspaper className="size-6 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold text-slate-100">AI Feed</h1>
          <p className="text-xs text-slate-400">{posts.length} posts &middot; {papers.length} papers &middot; {repos.length} repos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Experts", value: filteredExperts.length, color: "text-blue-400" },
          { icon: BookOpen, label: "X Posts", value: posts.length, color: "text-emerald-400" },
          { icon: FileText, label: "HF Papers", value: papers.length, color: "text-amber-400" },
          { icon: GitFork, label: "GH Repos", value: repos.length, color: "text-purple-400" },
        ].map((s, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`size-5 ${s.color}`} />
              <div>
                <p className="text-lg font-bold text-slate-100">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          {([
            { key: "all", label: "All", icon: Newspaper },
            { key: "feed", label: "X Feed", icon: TrendingUp },
            { key: "papers", label: "HF Papers", icon: FileText },
            { key: "repos", label: "GitHub", icon: GitFork },
            { key: "experts", label: "Experts", icon: Users },
          ] as const).map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? "default" : "ghost"}
              className={tab === t.key ? "bg-cyan-600 text-white" : "text-slate-400"}
              onClick={() => setTab(t.key)}
            >
              <t.icon className="size-3.5 mr-1" /> {t.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-800 text-slate-100" />
        </div>
        {(tab === "feed" || tab === "all") && (
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2">
            <option value="views">Top Views</option>
            <option value="likes">Top Likes</option>
            <option value="recent">Recent</option>
          </select>
        )}
        {tab === "all" && (
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)} className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2">
            <option value="">All Sources</option>
            <option value="x.com">X.com</option>
            <option value="huggingface">HuggingFace</option>
            <option value="github">GitHub</option>
          </select>
        )}
      </div>

      {/* === ALL FEED (merged) === */}
      {tab === "all" && (() => {
        const sourceBadge: Record<string, { label: string; color: string }> = {
          "x.com": { label: "X.com", color: "bg-sky-600/20 text-sky-400 border-sky-600/30" },
          "huggingface": { label: "HuggingFace", color: "bg-amber-600/20 text-amber-400 border-amber-600/30" },
          "github": { label: "GitHub", color: "bg-purple-600/20 text-purple-400 border-purple-600/30" },
        };
        type FeedItem = { id: string; source: string; title: string; content: string; author: string; url: string; likes: number; views: number; extra?: string; date?: string };
        const allItems: FeedItem[] = [
          ...filteredPosts.map((p) => ({ id: p.id, source: "x.com", title: p.expert.display_name, content: p.content, author: `${p.expert.handle} · ${p.expert.category}`, url: p.post_url, likes: p.likes, views: p.views, date: p.posted_at })),
          ...filteredPapers.map((p) => ({ id: p.id, source: "huggingface", title: p.title, content: p.description || "", author: p.authors || "", url: p.arxiv_url || "", likes: p.upvotes, views: p.github_stars, extra: `${formatNumber(p.github_stars)} GitHub stars` })),
          ...filteredRepos.map((r) => ({ id: r.id, source: "github", title: r.name, content: r.description || "", author: r.language || "", url: r.url || "", likes: r.stars, views: r.stars_week, extra: `+${formatNumber(r.stars_week)}/week` })),
        ]
          .filter((item) => !sourceFilter || item.source === sourceFilter)
          .sort((a, b) => sortBy === "likes" ? b.likes - a.likes : sortBy === "recent" ? new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime() : b.views - a.views);

        return (
          <div className="space-y-3">
            {allItems.map((item) => {
              const badge = sourceBadge[item.source];
              return (
                <Card key={`${item.source}-${item.id}`} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-[10px] px-2 py-0.5 ${badge.color}`}>{badge.label}</Badge>
                      <span className="text-sm font-semibold text-slate-100 truncate">{item.title}</span>
                      <span className="text-xs text-slate-500 truncate">{item.author}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-slate-500 hover:text-cyan-400 shrink-0"><ExternalLink className="size-4" /></a>}
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed mb-2">{item.content.length > 400 ? item.content.substring(0, 400) + "..." : item.content}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {item.source === "x.com" && (
                        <>
                          <span className="flex items-center gap-1 text-pink-400/70"><Heart className="size-3.5" /> {formatNumber(item.likes)}</span>
                          <span className="flex items-center gap-1 text-cyan-400/70"><Eye className="size-3.5" /> {formatNumber(item.views)}</span>
                        </>
                      )}
                      {item.source === "huggingface" && (
                        <>
                          <span className="flex items-center gap-1 text-amber-400"><ArrowUp className="size-3.5" /> {item.likes} upvotes</span>
                          <span className="flex items-center gap-1"><Star className="size-3.5 text-yellow-500" /> {item.extra}</span>
                        </>
                      )}
                      {item.source === "github" && (
                        <>
                          <span className="flex items-center gap-1"><Star className="size-3.5 text-yellow-500" /> {formatNumber(item.likes)} stars</span>
                          <span className="flex items-center gap-1 text-emerald-400"><TrendingUp className="size-3.5" /> {item.extra}</span>
                        </>
                      )}
                      {item.date && <span className="text-slate-600">{timeAgo(item.date)}</span>}
                      {item.source === "x.com" && (
                        <button
                          onClick={() => router.push(`/ai-feed/analyze?id=${item.id}`)}
                          className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-violet-300 hover:text-violet-200 hover:border-violet-400/50 transition-all text-xs font-medium"
                        >
                          <Sparkles className="size-3.5" /> Phân tích
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })()}

      {/* === X FEED === */}
      {tab === "feed" && (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {post.expert.avatar_url ? (
                    <img src={post.expert.avatar_url} alt="" className="size-8 rounded-full object-cover" />
                  ) : (
                    <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {(post.expert.display_name || "?")?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100 truncate">{post.expert.display_name}</span>
                      <span className="text-xs text-slate-500">{post.expert.handle}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${categoryColors[post.expert.category] || "bg-slate-700 text-slate-300"}`}>{post.expert.category}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo(post.posted_at)}</span>
                  </div>
                  {post.post_url && <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400"><ExternalLink className="size-4" /></a>}
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed mb-3">{post.content.length > 500 ? post.content.substring(0, 500) + "..." : post.content}</p>
                {post.media_urls && (() => {
                  try {
                    const imgs: string[] = JSON.parse(post.media_urls);
                    if (imgs.length === 0) return null;
                    return (
                      <div className={`mb-3 grid gap-1.5 ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {imgs.slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="" className="rounded-xl w-full object-cover max-h-[300px] bg-slate-800" loading="lazy" />
                        ))}
                      </div>
                    );
                  } catch { return null; }
                })()}
                <div className="flex items-center gap-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {formatNumber(post.replies)}</span>
                  <span className="flex items-center gap-1"><Repeat2 className="size-3.5" /> {formatNumber(post.reposts)}</span>
                  <span className="flex items-center gap-1 text-pink-400/70"><Heart className="size-3.5" /> {formatNumber(post.likes)}</span>
                  <span className="flex items-center gap-1 text-cyan-400/70"><Eye className="size-3.5" /> {formatNumber(post.views)}</span>
                  <button
                    onClick={() => router.push(`/ai-feed/analyze?id=${post.id}`)}
                    className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-violet-300 hover:text-violet-200 hover:border-violet-400/50 transition-all text-xs font-medium"
                  >
                    <Sparkles className="size-3.5" /> Phân tích
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* === HF PAPERS === */}
      {tab === "papers" && (
        <div className="space-y-3">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="bg-slate-900 border-slate-800 hover:border-amber-800/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0.5 min-w-[50px] pt-1">
                    <ArrowUp className="size-4 text-amber-400" />
                    <span className="text-lg font-bold text-amber-400">{paper.upvotes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 leading-tight">{paper.title}</h3>
                      {paper.arxiv_url && <a href={paper.arxiv_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-400 shrink-0"><ExternalLink className="size-4" /></a>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{paper.authors}</p>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">{paper.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      {paper.github_stars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3.5 text-yellow-500" /> {formatNumber(paper.github_stars)} stars
                        </span>
                      )}
                      <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 text-[10px]">Hugging Face</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* === GITHUB REPOS === */}
      {tab === "repos" && (
        <div className="space-y-3">
          {filteredRepos.map((repo) => (
            <Card key={repo.id} className="bg-slate-900 border-slate-800 hover:border-purple-800/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <GitFork className="size-4 text-purple-400" />
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-purple-300 hover:text-purple-200 truncate">
                        {repo.name}
                      </a>
                    </div>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">{repo.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Star className="size-3.5 text-yellow-500" /> {formatNumber(repo.stars)}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp className="size-3.5" /> +{formatNumber(repo.stars_week)}/week
                      </span>
                      {repo.language && <Badge className="bg-slate-800 text-slate-400 text-[10px]">{repo.language}</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* === EXPERTS === */}
      {tab === "experts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredExperts.map((expert: any) => (
            <Card key={expert.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                    {(expert.display_name || expert.handle)?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{expert.display_name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${categoryColors[expert.category] || "bg-slate-700 text-slate-300"}`}>{expert.category}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{expert.handle}</span>
                  </div>
                  <a href={expert.profile_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400"><ExternalLink className="size-4" /></a>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span>{expert.total_posts_scraped} posts</span>
                  {expert.focus_areas && (
                    <div className="flex gap-1 flex-wrap">
                      {JSON.parse(expert.focus_areas || "[]").slice(0, 3).map((t: string, i: number) => (
                        <span key={i} className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
