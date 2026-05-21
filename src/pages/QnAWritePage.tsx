import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageTransition } from "../hooks/usePageTransition";
import { createQuestion, getTags } from "../api/qna";
import type { QnaTag } from "../types/qna";

export default function QnAWritePage() {
  const visible = usePageTransition();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<QnaTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  function toggleTag(id: number) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      const question = await createQuestion({
        title: title.trim(),
        content: content.trim(),
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      navigate(`/qna/${question.id}`, { replace: true });
    } catch {
      alert("질문 등록에 실패했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
      {/* Back */}
      <div
        className={`pt-8 md:pt-12 transition-opacity duration-500 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <Link
          to="/qna"
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Q&A 목록
        </Link>
      </div>

      <header
        className={`pt-8 pb-8 transition-opacity duration-700 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
          질문하기
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          구체적으로 작성할수록 좋은 답변을 받을 수 있어요
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className={`pb-16 space-y-6 transition-all duration-700 delay-100 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="질문 제목을 입력해주세요"
            maxLength={255}
            className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors"
          />
        </div>

        {/* 태그 */}
        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              태그
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-sm px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "border-accent-primary bg-accent-muted text-accent-secondary"
                      : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            내용 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="질문 내용을 작성해주세요. 마크다운을 지원합니다."
            rows={14}
            className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            to="/qna"
            className="px-4 py-3 text-sm rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="px-4 py-1.5 text-sm rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "등록 중..." : "질문 등록"}
          </button>
        </div>
      </form>
    </main>
  );
}
