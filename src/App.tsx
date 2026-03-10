import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Megaphone, 
  Info, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  X,
  Volume2,
  Calendar,
  MapPin,
  Settings,
  Cpu,
  Zap,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { summarizeAnnouncement, summarizeDailyAnnouncements } from './services/geminiService';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'warning' | 'emergency';
  created_at: string;
  summary?: string;
}

export default function App() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'general' | 'warning' | 'emergency'>('general');
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [summarizingDaily, setSummarizingDaily] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDailySummary = async () => {
    const today = new Date().toLocaleDateString();
    const todaysAnnouncements = announcements.filter(a => 
      new Date(a.created_at).toLocaleDateString() === today
    );

    if (todaysAnnouncements.length === 0) {
      setDailySummary("오늘 등록된 새로운 공지사항이 없습니다.");
      return;
    }

    setSummarizingDaily(true);
    const summary = await summarizeDailyAnnouncements(todaysAnnouncements);
    setDailySummary(summary);
    setSummarizingDaily(false);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, type: newType }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setShowAdmin(false);
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSummarize = async (announcement: Announcement) => {
    if (announcement.summary) return;
    const summary = await summarizeAnnouncement(announcement.content);
    setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, summary } : a));
    setSelectedAnnouncement(prev => prev?.id === announcement.id ? { ...prev, summary } : prev);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'emergency': return <Activity className="w-4 h-4 text-red-400" />;
      default: return <Cpu className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
      case 'emergency': return 'text-red-400 border-red-400/30 bg-red-400/5';
      default: return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Futuristic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-8 sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505] animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                야학당 아파트
              </h1>
              <p className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase opacity-80">
                Smart Living OS v2.0
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowAdmin(true)}
            className="p-3 glass-panel rounded-2xl hover:bg-white/10 transition-all border-white/10"
          >
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 space-y-6 overflow-y-auto pb-32 relative z-10">
        {/* Daily Intelligence Report */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group mb-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[32px] blur opacity-20"></div>
          <div className="relative bg-[#0a0a0a]/60 backdrop-blur-md rounded-[32px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em]">
                <Activity className="w-4 h-4 animate-pulse" /> 데일리 브리핑
              </div>
              <button 
                onClick={handleDailySummary}
                disabled={summarizingDaily}
                className="text-[9px] bg-white text-black px-4 py-1.5 rounded-full font-black uppercase tracking-widest hover:bg-cyan-400 active:scale-95 transition-all disabled:opacity-50"
              >
                {summarizingDaily ? '분석 중...' : '리포트 생성'}
              </button>
            </div>
            
            {dailySummary ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-200 leading-relaxed font-medium markdown-body">
                  <Markdown>{dailySummary}</Markdown>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent rounded-full" />
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">브리핑 종료</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 font-medium italic">
                오늘의 모든 방송 내용을 종합 분석하여 핵심 브리핑을 생성합니다.
              </p>
            )}
          </div>
        </motion.div>

        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">중요 브리핑</h2>
            <div className="h-1 w-12 bg-cyan-500 rounded-full" />
          </div>
          <div className="glass-panel px-3 py-1 rounded-full border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {announcements.length}개 활성 노드
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-cyan-500/20 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-t-2 border-cyan-500 rounded-full animate-spin" />
            </div>
            <p className="text-xs font-bold text-cyan-500/60 tracking-[0.3em] uppercase">데이터 동기화 중...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="announcement-card group"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`type-badge ${getTypeColor(item.type)}`}>
                    {item.type === 'emergency' ? '위급' : item.type === 'warning' ? '경고' : '일반'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors leading-tight">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
                  {item.content}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                    상세 정보 확인 <ChevronRight className="w-3 h-3" />
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-cyan-500/20 transition-colors">
                    {getTypeIcon(item.type)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Futuristic FAB */}
      <button 
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-10 right-8 w-16 h-16 bg-gradient-to-tr from-cyan-500 to-purple-600 text-white rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:hidden"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="glass-panel w-full max-w-md rounded-[40px] p-8 pb-12 border-white/10 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
              
              <div className="flex justify-between items-start mb-8">
                <div className={`type-badge ${getTypeColor(selectedAnnouncement.type)}`}>
                  {selectedAnnouncement.type === 'emergency' ? '위급' : selectedAnnouncement.type === 'warning' ? '경고' : '일반'} 노드
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 active:scale-90 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <h2 className="text-3xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                {selectedAnnouncement.title}
              </h2>
              
              <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 mb-10 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-500" /> {new Date(selectedAnnouncement.created_at).toLocaleString()}</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /> 검증됨</span>
              </div>

              <div className="space-y-8">
                <div className="bg-white/5 rounded-[32px] p-8 border border-white/5">
                  <div className="text-slate-300 leading-relaxed font-medium text-base markdown-body">
                    <Markdown>{selectedAnnouncement.content}</Markdown>
                  </div>
                </div>

                {/* AI Intelligence Section */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-[#0a0a0a] rounded-[32px] p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-cyan-400 font-black text-xs uppercase tracking-[0.2em]">
                        <Volume2 className="w-5 h-5" /> AI 인텔리전스
                      </div>
                      {!selectedAnnouncement.summary && (
                        <button 
                          onClick={() => handleSummarize(selectedAnnouncement)}
                          className="text-[10px] bg-cyan-500 text-black px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        >
                          요약하기
                        </button>
                      )}
                    </div>
                    
                    {selectedAnnouncement.summary ? (
                      <div className="space-y-2">
                        <div className="text-sm text-slate-200 leading-relaxed font-bold italic markdown-body">
                          <Markdown>{selectedAnnouncement.summary}</Markdown>
                        </div>
                        <div className="flex gap-1">
                          <div className="h-1 w-8 bg-cyan-500 rounded-full" />
                          <div className="h-1 w-2 bg-slate-700 rounded-full" />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">
                        AI Core가 복잡한 방송 내용을 분석하여 최적화된 요약을 제공할 준비가 되었습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="w-full mt-10 bg-white text-black py-5 rounded-[24px] font-black uppercase tracking-[0.3em] text-xs hover:bg-cyan-400 active:scale-95 transition-all shadow-xl"
              >
                확인함
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
            onClick={() => setShowAdmin(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-sm rounded-[40px] p-10 border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">관리자 콘솔</h2>
                  <div className="h-1 w-8 bg-purple-500 rounded-full" />
                </div>
                <button onClick={() => setShowAdmin(false)} className="p-3 bg-white/5 hover:bg-white/10 active:scale-90 rounded-2xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddAnnouncement} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">제목</label>
                  <input 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">우선순위</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                  >
                    <option value="general" className="bg-[#0a0a0a]">일반</option>
                    <option value="warning" className="bg-[#0a0a0a]">경고</option>
                    <option value="emergency" className="bg-[#0a0a0a]">위급</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">내용</label>
                  <textarea 
                    required
                    rows={4}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="방송 내용을 입력하세요..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all resize-none placeholder:text-slate-700"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition-all mt-6"
                >
                  업데이트 방송하기
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 px-10 py-6 flex justify-between items-center z-30">
        <div className="flex flex-col items-center gap-2 text-cyan-400 group cursor-pointer active:scale-90 transition-all">
          <div className="p-2 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all">
            <Bell className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">공지</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-slate-600 group cursor-pointer active:scale-90 transition-all">
          <div className="p-2 rounded-xl hover:bg-white/5 transition-all">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">일정</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-slate-600 group cursor-pointer active:scale-90 transition-all">
          <div className="p-2 rounded-xl hover:bg-white/5 transition-all">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">위치</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-slate-600 group cursor-pointer active:scale-90 transition-all">
          <div className="p-2 rounded-xl hover:bg-white/5 transition-all">
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">설정</span>
        </div>
      </nav>
    </div>
  );
}
