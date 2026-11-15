import { mockSearchItems, type SearchItem, type SearchKind } from "@/mocks/specSearch";

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

/** UI 검색 계약. 실제 API 연동 시 여기서 서버 페이지와 응답을 변환한다. */
export async function searchSpecItems({
  kind,
  keyword,
  category,
  page = 1,
}: SearchQuery): Promise<SearchPage> {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("INVALID_PAGE");
  }

  const query = keyword.trim().toLocaleLowerCase();
  const filtered = mockSearchItems[kind].filter((item) => {
    const matchesKeyword = item.name.toLocaleLowerCase().includes(query);
    const matchesCategory =
      category === "all" ||
      (kind === "major" ? item.category === category : item.tab === category);
    return matchesKeyword && matchesCategory;
  });

  // Mock 페이지네이션 검증용. 실제 API는 해당 서비스의 size 기본값(20)을 사용.
  const size = 5;
  const start = (page - 1) * size;
  return {
    items: filtered.slice(start, start + size),
    total: filtered.length,
    hasNext: start + size < filtered.length,
  };
}