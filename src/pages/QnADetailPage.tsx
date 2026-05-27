import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePageTransition } from "../hooks/usePageTransition";
import { useAuth } from "../contexts/AuthContext";
import {
  getQuestion,
  deleteQuestion,
  resolveQuestion,
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  createVote,
  cancelVote,
  getMyVote,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/qna";
import { timeAgo } from "../utils/time";
import type {
  QuestionDetail,
  AnswerDetail,
  AnswerList,
  QnaComment,
  VoteType,
} from "../types/qna";

export default function QnADetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visible = usePageTransition();
  const { isAuthenticated, userId } = useAuth();

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answerList, setAnswerList] = useState<AnswerList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    Promise.all([getQuestion(Number(id)), getAnswers(Number(id))])
      .then(([q, a]) => {
        setQuestion(q);
        setAnswerList(a);
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("질문을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await deleteQuestion(question!.id);
      navigate("/qna", { replace: true });
    } catch {
      alert("삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  }

  async function handleResolve() {
    if (!window.confirm("질문을 해결됨으로 표시하시겠습니까?")) return;
    try {
      const updated = await resolveQuestion(question!.id);
      setQuestion(updated);
    } catch {
      alert("상태 변경에 실패했습니다.");
    }
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answerContent.trim()) return;
    setIsSubmitting(true);
    try {
      const newAnswer = await createAnswer(Number(id), {
        content: answerContent.trim(),
      });
      setAnswerList((prev) =>
        prev
          ? { ...prev, answers: [...prev.answers, newAnswer] }
          : { acceptedAnswer: null, answers: [newAnswer] },
      );
      setAnswerContent("");
      setQuestion((prev) =>
        prev ? { ...prev, answerCount: prev.answerCount + 1 } : prev,
      );
    } catch {
      alert("답변 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAnswer(answerId: number) {
    if (!window.confirm("답변을 삭제하시겠습니까?")) return;
    try {
      await deleteAnswer(answerId);
      setAnswerList((prev) => {
        if (!prev) return prev;
        return {
          acceptedAnswer:
            prev.acceptedAnswer?.id === answerId ? null : prev.acceptedAnswer,
          answers: prev.answers.filter((a) => a.id !== answerId),
        };
      });
      setQuestion((prev) =>
        prev
          ? { ...prev, answerCount: Math.max(0, prev.answerCount - 1) }
          : prev,
      );
    } catch {
      alert("삭제에 실패했습니다.");
    }
  }

  async function handleAcceptAnswer(answerId: number) {
    try {
      const updated = await acceptAnswer(answerId);
      setAnswerList((prev) => {
        if (!prev) return prev;
        const allAnswers = [
          ...(prev.acceptedAnswer
            ? [{ ...prev.acceptedAnswer, accepted: false }]
            : []),
          ...prev.answers,
        ].map((a) => (a.id === answerId ? updated : { ...a, accepted: false }));
        return {
          acceptedAnswer: updated,
          answers: allAnswers.filter((a) => !a.accepted),
        };
      });
      setQuestion((prev) =>
        prev ? { ...prev, hasAcceptedAnswer: true, status: "RESOLVED" } : prev,
      );
    } catch {
      alert("채택에 실패했습니다.");
    }
  }

  function handleUpdateAnswer(updated: AnswerDetail) {
    setAnswerList((prev) => {
      if (!prev) return prev;
      if (prev.acceptedAnswer?.id === updated.id) {
        return { ...prev, acceptedAnswer: updated };
      }
      return {
        ...prev,
        answers: prev.answers.map((a) => (a.id === updated.id ? updated : a)),
      };
    });
  }

  if (isLoading) {
    return (
      <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
        <div className="pt-40 flex justify-center">
          <div className="w-5 h-5 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (notFound || !question) {
    return (
      <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
        <div className="pt-40 text-center">
          <p className="text-sm text-text-tertiary">질문을 찾을 수 없습니다.</p>
          <Link
            to="/qna"
            className="mt-4 inline-block text-sm text-accent-primary hover:underline"
          >
            목록으로
          </Link>
        </div>
      </main>
    );
  }

  const isAuthor = isAuthenticated && userId === question.author.userId;
  const allAnswers = answerList
    ? [
        ...(answerList.acceptedAnswer ? [answerList.acceptedAnswer] : []),
        ...answerList.answers,
      ]
    : [];

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

      {/* Header */}
      <header
        className={`pt-8 pb-8 border-b border-border-default transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                question.hasAcceptedAnswer
                  ? "border-green-500/40 bg-green-500/10 text-green-500"
                  : "border-accent-primary/40 bg-accent-muted text-accent-secondary"
              }`}
            >
              {question.hasAcceptedAnswer ? "해결됨" : "미해결"}
            </span>
            {question.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2.5 py-1 rounded-full border border-border-default bg-bg-tertiary text-text-tertiary"
              >
                {tag.name}
              </span>
            ))}
          </div>
          {isAuthor && (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to={`/qna/${question.id}/edit`}
                className="text-xs px-3 py-1.5 rounded-md border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs px-3 py-1.5 rounded-md border border-border-default text-text-secondary hover:border-red-400/50 hover:text-red-400 transition-colors disabled:opacity-40"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-snug break-keep">
          {question.title}
        </h1>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-text-tertiary flex-wrap">
            <span>{question.author.nickname}</span>
            <span>&middot;</span>
            <span>{question.author.generation}기</span>
            <span>&middot;</span>
            <span>{timeAgo(question.createdAt)}</span>
            <span>&middot;</span>
            <span className="inline-flex items-center gap-1">
              <svg
                className="w-3 h-3"
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
              {question.viewCount}
            </span>
          </div>
          {isAuthor && question.status === "OPEN" && (
            <button
              onClick={handleResolve}
              className="shrink-0 text-xs px-3 py-1.5 rounded-md border border-green-500/40 text-green-500 hover:bg-green-500/10 transition-colors"
            >
              해결됨으로 표시
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div
        className={`py-10 border-b border-border-default transition-all duration-700 delay-100 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <div className="article-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {question.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Answers */}
      <div
        className={`pt-8 transition-all duration-700 delay-200 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <h2 className="text-sm font-semibold text-text-primary mb-6">
          답변 {question.answerCount}개
        </h2>

        {allAnswers.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">
            아직 답변이 없습니다.
          </p>
        ) : (
          <div className="space-y-6">
            {allAnswers.map((answer) => (
              <AnswerItem
                key={answer.id}
                answer={answer}
                isQuestionAuthor={isAuthor}
                isAnswerAuthor={
                  isAuthenticated && userId === answer.author.userId
                }
                isResolved={question.status === "RESOLVED"}
                isAuthenticated={isAuthenticated}
                currentUserId={userId}
                onDelete={handleDeleteAnswer}
                onAccept={handleAcceptAnswer}
                onUpdate={handleUpdateAnswer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer form */}
      <div
        className={`mt-10 pb-16 transition-all duration-700 delay-300 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          답변 작성
        </h3>
        {question.status === "RESOLVED" ? (
          <div className="py-6 text-center border border-border-default rounded-lg">
            <p className="text-sm text-text-tertiary">
              해결된 질문에는 답변을 달 수 없습니다.
            </p>
          </div>
        ) : isAuthenticated ? (
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="답변을 작성해주세요. 마크다운을 지원합니다."
              rows={6}
              className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !answerContent.trim()}
                className="px-4 py-1.5 text-sm rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "등록 중..." : "답변 등록"}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center border border-border-default rounded-lg">
            <p className="text-sm text-text-tertiary mb-3">
              답변을 작성하려면 로그인이 필요합니다.
            </p>
            <Link
              to="/login"
              className="text-sm text-accent-primary hover:underline"
            >
              로그인하기
            </Link>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="border-t border-border-default py-8 mb-16">
        <Link
          to="/qna"
          className="inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-accent-primary transition-colors"
        >
          <svg
            className="w-4 h-4"
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
          모든 질문 보기
        </Link>
      </div>
    </main>
  );
}

function AnswerItem({
  answer: initialAnswer,
  isQuestionAuthor,
  isAnswerAuthor,
  isResolved,
  isAuthenticated,
  currentUserId,
  onDelete,
  onAccept,
  onUpdate,
}: {
  answer: AnswerDetail;
  isQuestionAuthor: boolean;
  isAnswerAuthor: boolean;
  isResolved: boolean;
  isAuthenticated: boolean;
  currentUserId: number | null;
  onDelete: (id: number) => void;
  onAccept: (id: number) => void;
  onUpdate: (updated: AnswerDetail) => void;
}) {
  const [answer, setAnswer] = useState(initialAnswer);

  useEffect(() => {
    setAnswer(initialAnswer);
    setVoteCount(initialAnswer.voteCount);
  }, [initialAnswer]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Vote state
  const [myVote, setMyVote] = useState<VoteType | null>(null);
  const [voteCount, setVoteCount] = useState(answer.voteCount);
  const [isVoting, setIsVoting] = useState(false);

  // Comment state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<QnaComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getMyVote(answer.id)
      .then((res) => {
        if (!cancelled) setMyVote(res.type);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [answer.id, isAuthenticated]);

  async function handleVote(type: VoteType) {
    if (!isAuthenticated || isVoting) return;
    setIsVoting(true);
    try {
      if (myVote === type) {
        await cancelVote(answer.id);
        setMyVote(null);
        setVoteCount((c) => (type === "UPVOTE" ? c - 1 : c + 1));
      } else {
        if (myVote !== null) {
          await cancelVote(answer.id);
          setMyVote(null);
          setVoteCount((c) => (myVote === "UPVOTE" ? c - 1 : c + 1));
        }
        await createVote(answer.id, { type });
        setMyVote(type);
        setVoteCount((c) => (type === "UPVOTE" ? c + 1 : c - 1));
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 403) alert("본인 답변에는 투표할 수 없습니다.");
    } finally {
      setIsVoting(false);
    }
  }

  async function toggleComments() {
    if (!showComments && !commentsLoaded) {
      try {
        const data = await getComments(answer.id);
        setComments(data);
        setCommentsLoaded(true);
      } catch {
        alert("댓글을 불러오지 못했습니다.");
        return;
      }
    }
    setShowComments((v) => !v);
  }

  function startEdit() {
    setEditContent(answer.content);
    setIsEditing(true);
  }

  async function handleEditSave() {
    if (!editContent.trim()) return;
    setIsEditSaving(true);
    try {
      const updated = await updateAnswer(answer.id, {
        content: editContent.trim(),
      });
      setAnswer(updated);
      onUpdate(updated);
      setIsEditing(false);
    } catch {
      alert("수정에 실패했습니다.");
    } finally {
      setIsEditSaving(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setIsCommentSubmitting(true);
    try {
      const newComment = await createComment(answer.id, {
        content: commentContent.trim(),
      });
      setComments((prev) => [...prev, newComment]);
      setCommentContent("");
      setAnswer((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
    } catch {
      alert("댓글 등록에 실패했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setAnswer((prev) => ({
        ...prev,
        commentCount: Math.max(0, prev.commentCount - 1),
      }));
    } catch {
      alert("삭제에 실패했습니다.");
    }
  }

  function startEditComment(comment: QnaComment) {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  }

  async function handleEditCommentSave(commentId: number) {
    if (!editCommentContent.trim()) return;
    try {
      const updated = await updateComment(commentId, {
        content: editCommentContent.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c)),
      );
      setEditingCommentId(null);
    } catch {
      alert("수정에 실패했습니다.");
    }
  }

  return (
    <div
      className={`rounded-lg p-4 border ${
        answer.accepted
          ? "border-green-500/30 bg-green-500/5"
          : "border-border-default bg-bg-secondary"
      }`}
    >
      {/* Header: 작성자 + 채택 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-text-tertiary flex-wrap">
          <span className="font-medium text-text-secondary">
            {answer.author.nickname}
          </span>
          <span>&middot;</span>
          <span>{answer.author.generation}기</span>
          <span>&middot;</span>
          <span>{timeAgo(answer.createdAt)}</span>
        </div>
        {answer.accepted ? (
          <div className="flex items-center gap-1.5 text-sm text-green-500 font-medium shrink-0">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            채택된 답변
          </div>
        ) : isQuestionAuthor && !isResolved ? (
          <button
            onClick={() => onAccept(answer.id)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-md border border-green-500/40 text-green-500 hover:bg-green-500/10 transition-colors"
          >
            채택
          </button>
        ) : null}
      </div>

      {/* Content or Edit form */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2.5 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary outline-none focus:border-border-hover transition-colors resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm px-3 py-1.5 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleEditSave}
              disabled={isEditSaving || !editContent.trim()}
              className="text-sm px-3 py-1.5 rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors disabled:opacity-40"
            >
              {isEditSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <div className="article-prose text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {answer.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Footer */}
      {!isEditing && (
        <div className="mt-4 flex items-center justify-between text-sm text-text-tertiary">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote("UPVOTE")}
              disabled={isVoting || !isAuthenticated}
              title={isAuthenticated ? "추천" : "로그인이 필요합니다"}
              className={`p-1 rounded transition-colors disabled:cursor-default ${
                myVote === "UPVOTE"
                  ? "text-accent-secondary"
                  : "text-text-tertiary hover:text-accent-secondary"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill={myVote === "UPVOTE" ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                />
              </svg>
            </button>
            <span
              className={`text-sm font-medium min-w-[1ch] ${voteCount > 0 ? "text-accent-secondary" : voteCount < 0 ? "text-red-400" : "text-text-secondary"}`}
            >
              {voteCount}
            </span>
            <button
              onClick={() => handleVote("DOWNVOTE")}
              disabled={isVoting || !isAuthenticated}
              title={isAuthenticated ? "비추천" : "로그인이 필요합니다"}
              className={`p-1 rounded transition-colors disabled:cursor-default ${
                myVote === "DOWNVOTE"
                  ? "text-red-400"
                  : "text-text-tertiary hover:text-red-400"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill={myVote === "DOWNVOTE" ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleComments}
              className={`transition-colors ${showComments ? "text-text-primary" : "hover:text-text-primary"}`}
            >
              댓글 {answer.commentCount}
            </button>
            {isAnswerAuthor && (
              <button
                onClick={startEdit}
                className="hover:text-text-primary transition-colors"
              >
                수정
              </button>
            )}
            {isAnswerAuthor && (
              <button
                onClick={() => onDelete(answer.id)}
                className="hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comment section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border-default space-y-3">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="flex-1 px-2 py-1 bg-bg-primary border border-border-default rounded text-text-primary outline-none focus:border-border-hover"
                      />
                      <button
                        onClick={() => handleEditCommentSave(comment.id)}
                        disabled={!editCommentContent.trim()}
                        className="text-accent-secondary hover:text-accent-primary transition-colors disabled:opacity-40"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <span>
                        <span className="font-medium text-text-secondary mr-1.5">
                          {comment.author.nickname}
                        </span>
                        <span className="text-text-primary">
                          {comment.content}
                        </span>
                        <span className="ml-2 text-text-tertiary">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </span>
                      {isAuthenticated &&
                        currentUserId === comment.author.userId && (
                          <div className="flex gap-1.5 shrink-0 text-text-tertiary">
                            <button
                              onClick={() => startEditComment(comment)}
                              className="hover:text-text-primary transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="hover:text-red-400 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2">
              <input
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글 달기..."
                className="flex-1 px-2 py-1.5 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors"
              />
              <button
                type="submit"
                disabled={isCommentSubmitting || !commentContent.trim()}
                className="text-sm px-3 py-1.5 rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors disabled:opacity-40"
              >
                등록
              </button>
            </form>
          ) : (
            <p className="text-sm text-text-tertiary">
              <Link to="/login" className="text-accent-primary hover:underline">
                로그인
              </Link>
              하면 댓글을 달 수 있어요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
