import client from "./client";
import type {
  QuestionSummary,
  QuestionDetail,
  AnswerList,
  AnswerDetail,
  QnaTag,
  QnaComment,
  QuestionListParams,
  QuestionCreateRequest,
  QuestionUpdateRequest,
  AnswerCreateRequest,
  AnswerUpdateRequest,
  TagCreateRequest,
  VoteCreateRequest,
  MyVoteResponse,
  CommentCreateRequest,
  CommentUpdateRequest,
} from "../types/qna";

export async function getQuestions(
  params?: QuestionListParams,
): Promise<QuestionSummary[]> {
  const { data } = await client.get<QuestionSummary[]>("/api/v1/questions", {
    params,
  });
  return data;
}

export async function getQuestion(id: number): Promise<QuestionDetail> {
  const { data } = await client.get<QuestionDetail>(`/api/v1/questions/${id}`);
  return data;
}

export async function createQuestion(
  req: QuestionCreateRequest,
): Promise<QuestionDetail> {
  const { data } = await client.post<QuestionDetail>("/api/v1/questions", req);
  return data;
}

export async function updateQuestion(
  id: number,
  req: QuestionUpdateRequest,
): Promise<QuestionDetail> {
  const { data } = await client.patch<QuestionDetail>(
    `/api/v1/questions/${id}`,
    req,
  );
  return data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await client.delete(`/api/v1/questions/${id}`);
}

export async function resolveQuestion(id: number): Promise<QuestionDetail> {
  const { data } = await client.patch<QuestionDetail>(
    `/api/v1/questions/${id}/status`,
    {
      status: "RESOLVED",
    },
  );
  return data;
}

export async function getAnswers(questionId: number): Promise<AnswerList> {
  const { data } = await client.get<AnswerList>(
    `/api/v1/questions/${questionId}/answers`,
  );
  return data;
}

export async function createAnswer(
  questionId: number,
  req: AnswerCreateRequest,
): Promise<AnswerDetail> {
  const { data } = await client.post<AnswerDetail>(
    `/api/v1/questions/${questionId}/answers`,
    req,
  );
  return data;
}

export async function updateAnswer(
  answerId: number,
  req: AnswerUpdateRequest,
): Promise<AnswerDetail> {
  const { data } = await client.patch<AnswerDetail>(
    `/api/v1/answers/${answerId}`,
    req,
  );
  return data;
}

export async function deleteAnswer(answerId: number): Promise<void> {
  await client.delete(`/api/v1/answers/${answerId}`);
}

export async function acceptAnswer(answerId: number): Promise<AnswerDetail> {
  const { data } = await client.post<AnswerDetail>(
    `/api/v1/answers/${answerId}/accept`,
  );
  return data;
}

export async function getTags(): Promise<QnaTag[]> {
  const { data } = await client.get<QnaTag[]>("/api/v1/tags");
  return data;
}

export async function createTag(req: TagCreateRequest): Promise<QnaTag> {
  const { data } = await client.post<QnaTag>("/api/v1/tags", req);
  return data;
}

export async function deleteTag(tagId: number): Promise<void> {
  await client.delete(`/api/v1/tags/${tagId}`);
}

export async function createVote(
  answerId: number,
  req: VoteCreateRequest,
): Promise<void> {
  await client.post(`/api/v1/answers/${answerId}/votes`, req);
}

export async function cancelVote(answerId: number): Promise<void> {
  await client.delete(`/api/v1/answers/${answerId}/votes`);
}

export async function getMyVote(answerId: number): Promise<MyVoteResponse> {
  const { data } = await client.get<MyVoteResponse>(
    `/api/v1/answers/${answerId}/votes/me`,
  );
  return data;
}

export async function getComments(answerId: number): Promise<QnaComment[]> {
  const { data } = await client.get<QnaComment[]>(
    `/api/v1/answers/${answerId}/comments`,
  );
  return data;
}

export async function createComment(
  answerId: number,
  req: CommentCreateRequest,
): Promise<QnaComment> {
  const { data } = await client.post<QnaComment>(
    `/api/v1/answers/${answerId}/comments`,
    req,
  );
  return data;
}

export async function updateComment(
  commentId: number,
  req: CommentUpdateRequest,
): Promise<QnaComment> {
  const { data } = await client.patch<QnaComment>(
    `/api/v1/comments/${commentId}`,
    req,
  );
  return data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await client.delete(`/api/v1/comments/${commentId}`);
}
