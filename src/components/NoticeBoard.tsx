import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Calendar, ChevronDown, ChevronUp, Search, PlusCircle, Trash2, User } from "lucide-react";
import { NoticePost, WebsiteConfig } from "../types";
import MascotOni from "./MascotOni";

interface NoticeBoardProps {
  config: WebsiteConfig;
  notices: NoticePost[];
  isAdmin: boolean;
  onAddNotice: (post: Omit<NoticePost, "id" | "date">) => void;
  onDeleteNotice: (id: string) => void;
}

export default function NoticeBoard({ config, notices, isAdmin, onAddNotice, onDeleteNotice }: NoticeBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("notice-1");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // New Notice States
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("온가족간병협회");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }
    onAddNotice({
      title: newTitle,
      content: newContent,
      author: newAuthor,
    });
    setNewTitle("");
    setNewContent("");
    setIsFormOpen(false);
  };

  return (
    <section id="notices" className="py-12 px-4 max-w-6xl mx-auto scroll-mt-20">
      
      {/* SECTION TITLE */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="inline-block"
        >
          <span className="text-[11px] font-bold tracking-widest text-[#f43f5e] bg-rose-100 px-3 py-1 rounded-full uppercase shadow-sm">
            NOTICE BOARD
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] mt-2 tracking-tight whitespace-nowrap">
            알림 및 소식 게시판
          </h2>
        </motion.div>
      </div>

      {/* Mascot On-i speech bubble */}
      <div className="mb-8 max-w-3xl mx-auto">
        <MascotOni text={config.oniNoticeText} pose="smile" />
      </div>

      {/* Notice Board Container (Single column layout) */}
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-xl border border-white/50 rounded-[24px] p-6 md:p-8 shadow-xl flex flex-col gap-6 text-[#1a1a1a]">
        
        {/* Top Search bar & Admin Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="소식 제목이나 내용을 검색해 보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/70 border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] shadow-sm transition-all focus:bg-white"
            />
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#84cc16]" />
              <span>새 공지글 작성</span>
            </motion.button>
          )}
        </div>

        {/* Admin Write Notice Form Overlay */}
        <AnimatePresence>
          {isAdmin && isFormOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleFormSubmit}
              className="bg-slate-50 border border-slate-200 rounded-[20px] p-5 space-y-4 shadow-inner overflow-hidden text-[#1a1a1a]"
            >
              <h4 className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-pulse" />
                새 공지사항 글쓰기
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">제목</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="공지글 제목을 입력하세요."
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">작성자</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="작성 부서 또는 이름"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="공지사항 상세 내용을 입력하세요."
                  rows={4}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-2 text-[11px] font-black text-slate-500 bg-slate-200/50 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[11px] font-black text-white bg-[#1e3a8a] hover:bg-[#1a337a] rounded-lg shadow-sm cursor-pointer"
                >
                  게시물 등록
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Notices Stack Accordion */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-xs">
              검색 조건에 맞는 공지 및 안내 게시글이 없습니다.
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const isExpanded = expandedId === notice.id;

              return (
                <motion.div
                  key={notice.id}
                  layout="position"
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? "border-[#1e3a8a] bg-white shadow-md"
                      : "border-slate-200 bg-white/40 hover:bg-white/70"
                  }`}
                >
                  {/* Header Row */}
                  <div
                    onClick={() => toggleExpand(notice.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-[#1e3a8a] bg-blue-100/50 px-2 py-0.5 rounded border border-blue-100">
                          {notice.title.endsWith("?") ? "자주 묻는 질문" : "공식 안내"}
                        </span>
                        <div className="flex items-center text-[9px] text-slate-400 font-bold gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{notice.date}</span>
                        </div>
                      </div>
                      <h4 className="text-xs md:text-[13px] font-extrabold text-[#1e3a8a] truncate">
                        {notice.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("정말 이 공지글을 삭제하시겠습니까?")) {
                              onDeleteNotice(notice.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Body Content Drawer */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40"
                      >
                        <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                          {notice.content}
                        </p>
                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>작성자: {notice.author}</span>
                          </div>
                          <span>온가족간병협회 행정운영처</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
