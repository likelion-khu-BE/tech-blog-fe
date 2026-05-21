import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageTransition } from "../hooks/usePageTransition";
import { useAuth } from "../contexts/AuthContext";
import { getQuestions, getTags, createTag, deleteTag } from "../api/qna";
import { timeAgo } from "../utils/time";
import type { QuestionSummary, QnaTag } from "../types/qna";

function Dropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border-default bg-bg-secondary text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
      >
        {selected.label}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 min-w-full bg-bg-secondary border border-border-default rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left text-xs px-3 py-1.5 transition-colors ${
                opt.value === value
                  ? "text-text-primary bg-bg-tertiary"
                  : "text-text-secondary hover:bg-bg-tertiary/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "vote", label: "인기순" },
] as const;
const GENERATIONS = [14, 15] as const;

function sortTags(tags: QnaTag[]): QnaTag[] {
  return [...tags].sort((a, b) => {
    if (a.name === "기타") return 1;
    if (b.name === "기타") return -1;
    return a.name.localeCompare(b.name);
  });
}

export default function QnAPage() {
  const visible = usePageTransition();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [status, setStatus] = useState<string>("전체");
  const [sort, setSort] = useState<"latest" | "vote">("latest");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [generation, setGeneration] = useState<number | null>(null);

  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [tags, setTags] = useState<QnaTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  // 태그 관리 (ADMIN)
  const [showTagAdmin, setShowTagAdmin] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isTagCreating, setIsTagCreating] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);

  useEffect(() => {
    getTags()
      .then((data) => setTags(sortTags(data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchQuestions = useCallback(
    async (params: {
      status: string;
      sort: "latest" | "vote";
      keyword: string;
      tagId: number | null;
      generation: number | null;
    }) => {
      requestSeq.current += 1;
      const seq = requestSeq.current;
      try {
        const data = await getQuestions({
          status: params.status === "전체" ? undefined : params.status,
          sort: params.sort,
          keyword: params.keyword || undefined,
          tagId: params.tagId ?? undefined,
          generation: params.generation ?? undefined,
          size: 30,
        });
        if (seq !== requestSeq.current) return;
        setQuestions(data);
        setError(null);
      } catch {
        if (seq !== requestSeq.current) return;
        setError("질문 목록을 불러오지 못했습니다.");
      }
    },
    [],
  );

  useEffect(() => {
    setIsLoading(true);
    fetchQuestions({
      status,
      sort,
      keyword: debouncedKeyword,
      tagId: selectedTag,
      generation,
    }).finally(() => setIsLoading(false));
  }, [status, sort, debouncedKeyword, selectedTag, generation, fetchQuestions]);

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsTagCreating(true);
    try {
      const created = await createTag({ name: newTagName.trim() });
      setTags((prev) => sortTags([...prev, created]));
      setNewTagName("");
    } catch {
      alert("태그 생성에 실패했습니다.");
    } finally {
      setIsTagCreating(false);
    }
  }

  async function handleDeleteTag(tagId: number) {
    if (!window.confirm("태그를 삭제하시겠습니까?")) return;
    setDeletingTagId(tagId);
    try {
      await deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      if (selectedTag === tagId) setSelectedTag(null);
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingTagId(null);
    }
  }

  function handleWrite() {
    if (!isAuthenticated) {
      alert("질문을 작성하려면 로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    navigate("/qna/write");
  }

  return (
    <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
      <header
        className={`pt-14 md:pt-20 pb-8 transition-opacity duration-700 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight break-keep">
              Q&A
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              질문하고 답변하며 함께 성장해요
            </p>
          </div>
          <button
            onClick={handleWrite}
            className="text-xs md:text-sm px-3 py-1.5 rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            질문하기
          </button>
        </div>
      </header>

      {/* 검색 */}
      <div
        className={`mb-4 transition-opacity duration-700 delay-100 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35"
            />
            그{" "}
          </svg>
          <input
            type="text"
            placeholder="질문 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors"
          />
          {keyword && (
            <button
              aria-label="검색어 지우기"
              onClick={() => setKeyword("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 상태 탭 + 정렬 */}
      <div
        className={`flex items-center justify-between mb-3 transition-opacity duration-700 delay-150 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex gap-1">
          {(["전체", "OPEN", "RESOLVED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                status === tab
                  ? "bg-bg-tertiary text-text-primary"
                  : "text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50"
              }`}
            >
              {tab === "OPEN" ? "미해결" : tab === "RESOLVED" ? "해결됨" : tab}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                sort === opt.value
                  ? "text-text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 기수 드롭다운 + 태그 칩 */}
      <div
        className={`flex flex-wrap items-center gap-1.5 mb-4 transition-opacity duration-700 delay-200 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <Dropdown
          value={generation?.toString() ?? ""}
          onChange={(v) => setGeneration(v ? Number(v) : null)}
          options={[
            { value: "", label: "기수" },
            ...GENERATIONS.map((g) => ({ value: String(g), label: `${g}기` })),
          ]}
        />

        <div className="w-px h-3 bg-border-default mx-0.5" />

        <button
          onClick={() => setSelectedTag(null)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            selectedTag === null
              ? "border-accent-primary bg-accent-muted text-accent-secondary"
              : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
          }`}
        >
          전체 태그
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              setSelectedTag(selectedTag === tag.id ? null : tag.id)
            }
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              selectedTag === tag.id
                ? "border-accent-primary bg-accent-muted text-accent-secondary"
                : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* 태그 관리 (ADMIN 전용) */}
      {role === "ADMIN" && (
        <div
          className={`mb-4 transition-opacity duration-700 delay-200 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={() => setShowTagAdmin((v) => !v)}
            className="text-xs text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showTagAdmin ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            태그 관리
          </button>
          {showTagAdmin && (
            <div className="mt-2 p-3 rounded-lg border border-border-default bg-bg-secondary space-y-3">
              <form onSubmit={handleCreateTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="새 태그 이름"
                  className="flex-1 px-2.5 py-1.5 text-xs bg-bg-primary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors"
                />
                <button
                  type="submit"
                  disabled={isTagCreating || !newTagName.trim()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors disabled:opacity-40"
                >
                  {isTagCreating ? "추가 중..." : "+ 추가"}
                </button>
              </form>
              {tags.length === 0 ? (
                <p className="text-xs text-text-tertiary">
                  등록된 태그가 없습니다.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border-default bg-bg-primary"
                    >
                      <span className="text-text-secondary">{tag.name}</span>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={deletingTagId === tag.id}
                        className="text-text-tertiary hover:text-red-400 transition-colors disabled:opacity-40 leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 질문 목록 */}
      <section
        className={`pb-16 transition-opacity duration-700 delay-300 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-5 h-5 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-text-tertiary">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-tertiary">
            {keyword
              ? `"${keyword}"에 대한 검색 결과가 없습니다.`
              : "아직 질문이 없습니다."}
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {questions.map((q) => (
              <Link
                key={q.id}
                to={`/qna/${q.id}`}
                className="block py-5 hover:bg-bg-secondary/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          q.hasAcceptedAnswer
                            ? "bg-green-500/10 text-green-500"
                            : q.status === "RESOLVED"
                              ? "bg-bg-tertiary text-text-tertiary"
                              : "bg-accent-muted text-accent-secondary"
                        }`}
                      >
                        {q.hasAcceptedAnswer
                          ? "해결됨"
                          : q.status === "OPEN"
                            ? "미해결"
                            : "종료"}
                      </span>
                      {q.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-bg-tertiary rounded text-text-tertiary"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-text-primary break-keep leading-snug">
                      {q.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <span>{q.author.nickname}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(q.createdAt)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1 text-xs text-text-tertiary">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {q.answerCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {q.viewCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
