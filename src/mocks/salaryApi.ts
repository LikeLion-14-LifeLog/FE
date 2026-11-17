import type {
  SalarySimulationRequest,
  SalarySimulationResponse,
  SalaryTargetSaveResponse,
  SalaryTargetResponse,
} from "@/types/salaryApi";

export const salarySimulationRequestMock = {
  baseSpecProfileId: 10,
  companyGroupScale: "LARGE",
  changes: {
    experiences: [
      {
        type: "INTERNSHIP",
        title: "백엔드 개발 인턴",
        startedYearMonth: "2027-01",
        endedYearMonth: "2027-06",
        description: "API 개발 및 서비스 운영 경험",
        awarded: false,
        organizerName: null,
        awardGrade: null,
      },
    ],
  },
} satisfies SalarySimulationRequest;

export const salarySimulationResponseMock = {
  success: true,
  code: "COMMON_200",
  message: "연봉 시뮬레이션 성공",
  data: {
    baseSpecProfileId: 10,
    companyGroupScale: "LARGE",
    base: {
      salaryResults: [
        {
          annual: 0,
          annualIncomeMin: 34000000,
          annualIncomeExpected: 36000000,
          annualIncomeMax: 38500000,
          topPercent: 28,
        },
        {
          annual: 3,
          annualIncomeMin: 42000000,
          annualIncomeExpected: 44500000,
          annualIncomeMax: 47500000,
          topPercent: null,
        },
        {
          annual: 5,
          annualIncomeMin: 51000000,
          annualIncomeExpected: 54500000,
          annualIncomeMax: 58000000,
          topPercent: null,
        },
      ],
    },
    simulated: {
      salaryResults: [
        {
          annual: 0,
          annualIncomeMin: 39000000,
          annualIncomeExpected: 41000000,
          annualIncomeMax: 43000000,
          topPercent: 16,
        },
        {
          annual: 3,
          annualIncomeMin: 47000000,
          annualIncomeExpected: 49500000,
          annualIncomeMax: 52000000,
          topPercent: null,
        },
        {
          annual: 5,
          annualIncomeMin: 56000000,
          annualIncomeExpected: 59500000,
          annualIncomeMax: 63000000,
          topPercent: null,
        },
      ],
    },
    preparationPeriod: "약 6개월",
    estimatedCost: "직접 준비 비용은 별도 확인 필요 (인턴 급여와 분리)",
    decisionCriteria:
      "실무 수행 경험과 서비스 운영 역량을 평가하는 직무 지원에 적합",
  },
} satisfies SalarySimulationResponse;

export const salaryBaseResponseMock: SalarySimulationResponse = {
  ...salarySimulationResponseMock,
  data: {
    ...salarySimulationResponseMock.data,
    simulated: null,
    preparationPeriod: null,
    estimatedCost: null,
    decisionCriteria: null,
  },
};

export const salaryTargetSaveResponseMock = {
  success: true,
  code: "COMMON_200",
  message: "목표 스펙과 AI 추천 대안이 저장되었습니다.",
  data: {
    baseSpecProfileId: 10,
    companyGroupScale: "LARGE",
    currency: "KRW",
    baseExpectedStartingSalary: 36000000,
    selectedTargetSpecProfileId: 11,
    options: [
      {
        slotNumber: 1,
        targetSpecProfileId: 11,
        source: "USER_INPUT",
        selected: true,
        title: "백엔드 개발 인턴 6개월",
        expectedStartingSalary: 41000000,
        salaryIncreaseAmount: 5000000,
        preparationPeriod: "약 6개월",
        estimatedCost:
          "직접 준비 비용은 별도 확인 필요 (인턴 급여와 분리)",
        decisionCriteria:
          "실무 수행 경험과 서비스 운영 역량을 평가하는 직무 지원에 적합",
      },
      {
        slotNumber: 2,
        targetSpecProfileId: 12,
        source: "AI_RECOMMENDATION",
        selected: false,
        title: "AWS SAA 자격증 취득",
        expectedStartingSalary: 39000000,
        salaryIncreaseAmount: 3000000,
        preparationPeriod: "약 2~3개월",
        estimatedCost:
          "약 35만 원 (응시료·교재비 기준 참고 추정)",
        decisionCriteria:
          "클라우드 기반 서비스 개발에 필요한 기본 역량 보완에 적합",
      },
      {
        slotNumber: 3,
        targetSpecProfileId: 13,
        source: "AI_RECOMMENDATION",
        selected: false,
        title: "일반대학원 석사 과정",
        expectedStartingSalary: 45500000,
        salaryIncreaseAmount: 9500000,
        preparationPeriod: "약 2년 (4학기 기준)",
        estimatedCost:
          "약 1,200만 원 (등록금 기준 참고 추정, 생활비 제외)",
        decisionCriteria:
          "전공 심화 지식과 연구 경험을 요구하는 연구개발 직무 지원에 적합",
      },
    ],
    salaryNotice:
      "KEEPⅡ 비교 표본 기반 원화 연환산 예측값입니다. 연차별 연봉은 AI 추정값이며 세전·세후 및 성과급 포함 여부는 확인되지 않았습니다.",
    preparationNotice:
      "준비 기간과 비용은 참고 추정치이며 개인 상황에 따라 달라질 수 있습니다.",
  },
} satisfies SalaryTargetSaveResponse;

export const salaryTargetResponseMock = {
  success: true,
  code: "COMMON_200",
  message: "요청 성공",
  data: {
    targetSpecProfileId: 11,
    baseSpecProfileId: 10,
    companyGroupScale: "LARGE",
    changes: {
      academicAbilities: [],
      certificates: [],
      languageExamScores: [],
      experiences: [
        {
          experienceId: 51,
          type: "INTERNSHIP",
          title: "백엔드 개발 인턴",
          startedYearMonth: "2027-01",
          endedYearMonth: "2027-06",
          description: "API 개발 및 서비스 운영 경험",
          awarded: false,
          organizerName: null,
          awardGrade: null,
        },
      ],
    },
  },
} satisfies SalaryTargetResponse;

export const salaryTargetEmptyResponseMock: SalaryTargetResponse = {
  success: true,
  code: "COMMON_200",
  message: "요청 성공",
  data: null,
};