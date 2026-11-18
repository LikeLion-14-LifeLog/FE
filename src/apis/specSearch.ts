import {
  fromJob,
  mockSearchItems,
  type SearchItem,
  type SearchKind,
} from "@/mocks/specSearch";
import type { JobSearchResponse } from "@/types/spec/search";

export type SearchQuery = {
  kind: SearchKind;
  keyword: string;
  category: string;
  page?: number;
};

export type SearchPage = {
  items: SearchItem[];
  total: number;
  hasNext: boolean;
};

async function searchJobs(keyword: string, page: number): Promise<SearchPage> {
  const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("API 기본 주소가 설정되지 않았습니다.");
  }

  const accessToken = localStorage.getItem("accessToken")?.trim();

  if (!accessToken) {
    throw new Error("직무 조회에 필요한 인증 토큰이 없습니다.");
  }

  const params = new URLSearchParams({
    page: String(page),
    size: "20",
  });

  const query = keyword.trim();

  if (query) {
    params.set("keyword", query);
  }

  const response = await fetch(`${baseUrl}/api/jobs?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`직무 조회 실패 (HTTP ${response.status})`);
  }

  const body: JobSearchResponse = await response.json();

  if (
    body.success !== true ||
    !Array.isArray(body.data?.jobs) ||
    !Number.isSafeInteger(body.data.totalElements) ||
    body.data.totalElements < 0 ||
    typeof body.data.hasNext !== "boolean"
  ) {
    throw new Error("직무 조회 응답이 올바르지 않습니다.");
  }

  return {
    items: body.data.jobs.map(fromJob),
    total: body.data.totalElements,
    hasNext: body.data.hasNext,
  };
}

export async function searchSpecItems({
  kind,
  keyword,
  category,
  page = 1,
}: SearchQuery): Promise<SearchPage> {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("INVALID_PAGE");
  }

  if (kind === "job") {
    return searchJobs(keyword, page);
  }

  // 전공·자격증·어학은 각 API 연결 전까지 기존 Mock을 유지한다.
  const query = keyword.trim().toLocaleLowerCase();
  const filtered = mockSearchItems[kind].filter((item) => {
    const matchesKeyword = item.name.toLocaleLowerCase().includes(query);
    const matchesCategory =
      category === "all" ||
      (kind === "major" ? item.category === category : item.tab === category);

    return matchesKeyword && matchesCategory;
  });

  const size = 5;
  const start = (page - 1) * size;

  return {
    items: filtered.slice(start, start + size),
    total: filtered.length,
    hasNext: start + size < filtered.length,
  };
}
