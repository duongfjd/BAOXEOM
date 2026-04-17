import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Newspaper, Calendar, User, ExternalLink, ChevronRight, Search, Volume2, VolumeX, Pause, Play, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "./supabaseClient";

interface Article {
  id: number;
  url: string;
  original_title: string;
  title_vi: string;
  summary_vi: string;
  category: string;
  published_at: string;
  source_name: string;
  author: string;
  url_to_image: string;
}

// --- Components ---

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <Newspaper className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl font-serif">
            Tin Tức <span className="text-zinc-500">24h</span>
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Trang chủ</Link>
          <a href="#" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Phổ biến</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Badge variant="outline" className="hidden sm:flex border-zinc-300 text-zinc-600">
            Live
          </Badge>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <Newspaper className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold font-serif">Tin Tức 24h</h2>
            </div>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              Cập nhật tin tức mới nhất từ các nguồn uy tín. Hệ thống tự động tổng hợp và dịch thuật bằng AI để mang lại trải nghiệm đọc tốt nhất.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest">Danh mục</h3>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Thế giới</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Công nghệ</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Kinh doanh</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Thể thao</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest">Liên hệ</h3>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Bảo mật</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Góp ý</a></li>
            </ul>
          </div>
        </div>
        <Separator className="my-12 bg-zinc-100" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-medium">
          <p>© 2026 Tin Tức 24h. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-900 transition-colors">Facebook</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Pages ---

function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('articles').select('category');
      if (error) throw error;
      const cats = Array.from(new Set(data.filter(i => i.category).map(item => item.category)));
      setCategories(cats as string[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase.from('articles').select('*').order('published_at', { ascending: false });
      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query;
      if (error) throw error;
      setArticles(data as unknown as Article[]);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Hero Section */}
      {!loading && articles.length > 0 && selectedCategory === "all" && (
        <section className="mb-10 md:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
          >
            <div className="lg:col-span-8">
              <div 
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-zinc-900 aspect-[4/3] md:aspect-[16/9] cursor-pointer"
                onClick={() => navigate(`/article/${articles[0].id}`)}
              >
                <img 
                  src={articles[0].url_to_image || "https://picsum.photos/seed/news/800/450"} 
                  alt={articles[0].title_vi}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
                  <Badge className="mb-3 md:mb-4 bg-white text-black hover:bg-zinc-200">
                    {articles[0].category || "Tin mới nhất"}
                  </Badge>
                  <h2 className="mb-3 md:mb-4 text-2xl font-bold text-white md:text-5xl font-serif leading-tight">
                    {articles[0].title_vi || articles[0].original_title}
                  </h2>
                  <p className="mb-4 md:mb-6 max-w-2xl text-zinc-300 line-clamp-2 text-sm md:text-lg">
                    {articles[0].summary_vi}
                  </p>
                  <div className="flex items-center gap-4 text-xs md:text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 md:h-4 md:w-4" /> {articles[0].source_name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" /> {formatDate(articles[0].published_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-serif">Tin nổi bật</h3>
                <button className="text-sm text-zinc-500 hover:text-zinc-900">Xem tất cả</button>
              </div>
              <ScrollArea className="h-[400px] md:h-[500px] pr-4">
                <div className="flex flex-col gap-5 md:gap-6">
                  {articles.slice(1, 6).map((article, idx) => (
                    <motion.div 
                      key={article.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex gap-4 cursor-pointer"
                      onClick={() => navigate(`/article/${article.id}`)}
                    >
                      <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                        <img 
                          src={article.url_to_image || `https://picsum.photos/seed/${article.id}/200/200`} 
                          alt={article.title_vi}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          {article.category || "General"}
                        </span>
                        <h4 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-zinc-600 transition-colors">
                          {article.title_vi || article.original_title}
                        </h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </section>
      )}

      {/* Category Tabs */}
      <section className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-zinc-100 p-1 rounded-xl h-auto flex-wrap sm:flex-nowrap">
              <TabsTrigger value="all" className="rounded-lg px-4 md:px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">
                Tất cả
              </TabsTrigger>
              {categories.slice(0, 8).map(cat => (
                <TabsTrigger key={cat} value={cat} className="rounded-lg px-4 md:px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm capitalize text-xs md:text-sm">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={selectedCategory} className="mt-0 outline-none">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {articles.map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 8) * 0.05 }}
                    className="cursor-pointer"
                    onClick={() => navigate(`/article/${article.id}`)}
                  >
                    <Card className="group h-full border-none bg-transparent shadow-none">
                      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-200 shadow-sm">
                        <img 
                          src={article.url_to_image || `https://picsum.photos/seed/${article.id}/400/250`} 
                          alt={article.title_vi}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-black backdrop-blur-sm hover:bg-white border-none text-[10px]">
                            {article.category || "Tin tức"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-0">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          <span>{article.source_name || "News"}</span>
                          <span>•</span>
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        <CardTitle className="line-clamp-2 text-base md:text-lg font-bold leading-tight group-hover:text-zinc-600 transition-colors font-serif">
                          {article.title_vi || article.original_title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-3">
                        <p className="line-clamp-3 text-xs md:text-sm text-zinc-500 leading-relaxed">
                          {article.summary_vi}
                        </p>
                      </CardContent>
                      <CardFooter className="p-0 mt-4">
                        <div className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-zinc-900 group-hover:gap-2 transition-all">
                          Xem chi tiết <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synth.current = window.speechSynthesis;
    
    // Some browsers need this to load voices
    const loadVoices = () => {
      if (synth.current) {
        synth.current.getVoices();
      }
    };
    
    loadVoices();
    if (synth.current && synth.current.onvoiceschanged !== undefined) {
      synth.current.onvoiceschanged = loadVoices;
    }

    fetchArticle();
    window.scrollTo(0, 0);
    return () => {
      if (synth.current) synth.current.cancel();
    };
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
      if (error) throw error;
      setArticle(data as unknown as Article);
    } catch (error) {
      console.error("Error fetching article:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const toggleSpeech = () => {
    if (!article || !synth.current) return;

    if (isSpeaking) {
      if (isPaused) {
        synth.current.resume();
        setIsPaused(false);
      } else {
        synth.current.pause();
        setIsPaused(true);
      }
    } else {
      // Cancel any ongoing speech first
      synth.current.cancel();

      const textToRead = `${article.title_vi}. ${article.summary_vi}`;
      const newUtterance = new SpeechSynthesisUtterance(textToRead);
      
      // Find a Vietnamese voice
      const voices = synth.current.getVoices();
      console.log("Available voices:", voices.length);
      
      // Try multiple ways to find a Vietnamese voice
      const viVoice = voices.find(v => 
        v.lang === "vi-VN" || 
        v.lang === "vi_VN" || 
        v.lang.startsWith("vi") || 
        v.name.toLowerCase().includes("vietnam")
      );
      
      if (viVoice) {
        console.log("Selected Vietnamese voice:", viVoice.name);
        newUtterance.voice = viVoice;
      } else {
        console.warn("Vietnamese voice not found, falling back to lang property");
      }
      
      newUtterance.lang = "vi-VN";
      newUtterance.rate = 0.9; // Slightly slower for better clarity
      newUtterance.pitch = 1.0;
      
      newUtterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      newUtterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      newUtterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error", event);
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      utterance.current = newUtterance;
      synth.current.speak(newUtterance);
    }
  };

  const stopSpeech = () => {
    if (synth.current) {
      synth.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="aspect-[16/9] w-full rounded-3xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!article) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-6 md:py-12 max-w-4xl"
    >
      <Button 
        variant="ghost" 
        className="mb-6 md:mb-8 gap-2 -ml-2 text-zinc-500 hover:text-zinc-900"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      <div className="flex flex-col">
        <div className="relative aspect-[16/9] w-full mb-8 md:mb-12 overflow-hidden rounded-2xl md:rounded-3xl shadow-xl">
          <img 
            src={article.url_to_image || `https://picsum.photos/seed/${article.id}/800/450`} 
            alt={article.title_vi}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Badge className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border-none px-4 py-1">
            {article.category || "Tin tức"}
          </Badge>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="rounded-full gap-2 border-zinc-200 shadow-sm"
              onClick={toggleSpeech}
            >
              {isSpeaking ? (
                isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />
              ) : <Volume2 className="h-4 w-4" />}
              {isSpeaking ? (isPaused ? "Tiếp tục đọc" : "Tạm dừng") : "Đọc bài viết"}
            </Button>
            {isSpeaking && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={stopSpeech}
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold font-serif leading-tight mb-6 text-zinc-900">
          {article.title_vi || article.original_title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-zinc-500 mb-10 pb-10 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center">
              <User className="h-4 w-4 text-zinc-500" />
            </div>
            <span className="font-medium text-zinc-900">{article.source_name || "Unknown Source"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>

        <div className="prose prose-zinc max-w-none">
          <p className="text-xl md:text-2xl text-zinc-700 leading-relaxed font-serif mb-8 italic border-l-4 border-zinc-900 pl-6">
            {article.summary_vi}
          </p>
          
          <div className="bg-zinc-50 rounded-2xl p-6 md:p-8 border border-zinc-100 mb-12">
            <p className="text-zinc-600 leading-relaxed mb-6">
              Nội dung chi tiết của bài báo hiện đang được xử lý. Bạn có thể xem bài viết đầy đủ cùng các hình ảnh và video liên quan trực tiếp tại trang nguồn chính thức.
            </p>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 w-full md:w-auto"
            >
              Xem bài viết gốc <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
