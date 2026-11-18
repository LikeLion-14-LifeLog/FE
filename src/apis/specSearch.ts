import {
  fromJob,
  fromMajor,
  fromCertificate,
  mockSearchItems,
  type SearchItem,
  type SearchKind,
} from "@/mocks/specSearch";
import type {
  JobSearchData,
  MajorSearchData,
  CertificationSearchData,
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

  const response = await fetch(`${baseUrl}${path}?${params}`, {
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

  // 어학 목록은 다음 API 연동 단계에서 교체한다.
  if (kind === "language") {
    const filtered = mockSearchItems.language.filter((item) => {
      const matchesKeyword = item.name
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase());
      const matchesCategory = category === "all" || item.tab === category;

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
