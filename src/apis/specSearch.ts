import {
  fromJob,
  fromMajor,
  fromCertificate,
  fromLanguageExam,
  type SearchItem,
  type SearchKind,
} from "@/constants/specSearch";
import type {
  JobSearchData,
  MajorSearchData,
  CertificationSearchData,
  LanguageExamSearchData,
  StandardSearchResponse,
} from "@/types/spec/search";

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

async function fetchSearchData<T>(
  path: string,
  params: URLSearchParams
): Promise<T> {
  const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("API 기본 주소가 설정되지 않았습니다.");
  }

  const accessToken = localStorage.getItem("accessToken")?.trim();

  if (!accessToken) {
    throw new Error("검색에 필요한 인증 토큰이 없습니다.");
  }

  const query = params.toString();
  const url = `${baseUrl}${path}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`검색 요청 실패 (HTTP ${response.status})`);
  }

  const body: StandardSearchResponse<T> = await response.json();

  if (body.success !== true || body.data == null) {
    throw new Error("검색 응답이 올바르지 않습니다.");
  }

  return body.data;
}

export async function getLanguageExams(
  keyword = "",
  languageType = "all"
): Promise<LanguageExamSearchData> {
  const params = new URLSearchParams();
  const query = keyword.trim();

  if (query) {
    params.set("keyword", query);
  }

  if (languageType !== "all") {
    params.set("languageType", languageType);
  }

  const data = await fetchSearchData<LanguageExamSearchData>(
    "/api/language-exams",
    params
  );

  if (
    !Array.isArray(data.languageExams) ||
    !Number.isSafeInteger(data.totalCount) ||
    data.totalCount < 0
  ) {
    throw new Error("어학시험 목록 응답이 올바르지 않습니다.");
  }

  return data;
}

function toSearchPage<T>(
  items: T[],
  data: { totalElements: number; hasNext: boolean },
  toItem: (item: T) => SearchItem
): SearchPage {
  if (
    !Array.isArray(items) ||
    !Number.isSafeInteger(data.totalElements) ||
    data.totalElements < 0 ||
    typeof data.hasNext !== "boolean"
  ) {
    throw new Error("검색 목록 응답이 올바르지 않습니다.");
  }

  return {
    items: items.map(toItem),
    total: data.totalElements,
    hasNext: data.hasNext,
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

  const query = keyword.trim();

  if (kind === "language") {
    const data = await getLanguageExams(query, category);

    return {
      items: data.languageExams.map(fromLanguageExam),
      total: data.totalCount,
      hasNext: false,
    };
  }

  const params = new URLSearchParams({
    page: String(page),
    size: "20",
  });

  if (query) {
    params.set("keyword", query);
  }

  if (kind === "job") {
    const data = await fetchSearchData<JobSearchData>("/api/jobs", params);

    return toSearchPage(data.jobs, data, fromJob);
  }

  if (kind === "major") {
    if (category !== "all") {
      params.set("mainField", category);
    }

    const data = await fetchSearchData<MajorSearchData>("/api/majors", params);

    return toSearchPage(data.majors, data, fromMajor);
  }

  if (category !== "all") {
    params.set("type", category);
  }

  const data = await fetchSearchData<CertificationSearchData>(
    "/api/certifications",
    params
  );

  return toSearchPage(data.certifications, data, fromCertificate);
}
