export type CategoryId =
  | "all"
  | "olleh"
  | "fuel"
  | "convenience"
  | "department"
  | "burger"
  | "cafe"
  | "service"
  | "health"
  | "mart"
  | "bakery"
  | "lifestyle"
  | "mart-voucher"
  | "book"
  | "icecream"
  | "dining"
  | "etc-voucher"
  | "music"
  | "movie"
  | "pizza"
  | "chicken";

export type Category = {
  id: CategoryId;
  label: string;
};

export const CATEGORIES: Category[] = [
  { id: "all", label: "전체" },
  { id: "chicken", label: "치킨" },
  { id: "pizza", label: "피자" },
  { id: "burger", label: "버거" },
  { id: "cafe", label: "커피/음료" },
  { id: "convenience", label: "편의점" },
  { id: "bakery", label: "베이커리/도넛" },
  { id: "icecream", label: "아이스크림" },
  { id: "dining", label: "외식" },
  { id: "department", label: "백화점 상품권" },
  { id: "mart-voucher", label: "마트상품권" },
  { id: "fuel", label: "주유상품권" },
  { id: "etc-voucher", label: "기타상품권" },
  { id: "mart", label: "마트" },
  { id: "health", label: "건강/식품/주방" },
  { id: "lifestyle", label: "생활/가전/디지털" },
  { id: "book", label: "도서" },
  { id: "music", label: "음악" },
  { id: "movie", label: "영화" },
  { id: "service", label: "용역서비스" },
  { id: "olleh", label: "올레" },
];

export const CATEGORY_BRANDS: Record<CategoryId, string[]> = {
  all: [],
  chicken: ["BBQ", "교촌치킨", "굽네치킨", "네네치킨", "bhc", "페리카나", "푸라닭", "처갓집"],
  pizza: ["도미노피자", "피자헛", "미스터피자", "파파존스", "피자스쿨", "피자나라치킨공주"],
  burger: ["맥도날드", "버거킹", "롯데리아", "맘스터치", "KFC", "쉐이크쉑", "써브웨이"],
  cafe: ["스타벅스", "이디야", "투썸플레이스", "커피빈", "할리스", "탐앤탐스", "메가커피", "컴포즈커피", "빽다방", "공차"],
  convenience: ["GS25", "CU", "세븐일레븐", "이마트24"],
  bakery: ["파리바게뜨", "뚜레쥬르", "던킨", "크리스피크림", "성심당"],
  icecream: ["배스킨라빈스", "하겐다즈", "나뚜루", "설빙"],
  dining: ["VIPS", "아웃백", "TGIF", "애슐리퀸즈", "빕스", "본죽", "교대이층집"],
  department: ["신세계상품권", "롯데백화점", "현대백화점", "갤러리아"],
  "mart-voucher": ["이마트", "홈플러스", "롯데마트", "코스트코"],
  fuel: ["GS칼텍스", "SK에너지", "S-OIL", "현대오일뱅크"],
  "etc-voucher": ["문화상품권", "도서문화상품권", "해피머니", "북앤라이프"],
  mart: ["이마트", "홈플러스", "롯데마트", "노브랜드"],
  health: ["올리브영", "랄라블라", "롭스", "다이소"],
  lifestyle: ["다이소", "이케아", "쿠쿠", "리큅", "삼성전자", "LG전자"],
  book: ["교보문고", "예스24", "알라딘", "영풍문고"],
  music: ["멜론", "지니뮤직", "벅스", "플로", "스포티파이"],
  movie: ["CGV", "메가박스", "롯데시네마"],
  service: ["스파", "마사지", "헤어샵", "네일샵"],
  olleh: ["KT olleh", "olleh tv", "olleh wifi"],
};

export type PriceRangeId =
  | "all"
  | "under-3k"
  | "3k-5k"
  | "5k-10k"
  | "10k-30k"
  | "30k-50k"
  | "50k-100k"
  | "over-100k";

export type PriceRange = {
  id: PriceRangeId;
  label: string;
  min: number;
  max: number | null;
};

export const PRICE_RANGES: PriceRange[] = [
  { id: "all", label: "전체", min: 0, max: null },
  { id: "under-3k", label: "3천원 이하", min: 0, max: 3000 },
  { id: "3k-5k", label: "3천원 - 5천원", min: 3000, max: 5000 },
  { id: "5k-10k", label: "5천원 - 1만원", min: 5000, max: 10000 },
  { id: "10k-30k", label: "1만원 - 3만원", min: 10000, max: 30000 },
  { id: "30k-50k", label: "3만원 - 5만원", min: 30000, max: 50000 },
  { id: "50k-100k", label: "5만원 - 10만원", min: 50000, max: 100000 },
  { id: "over-100k", label: "10만원 이상", min: 100000, max: null },
];

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  price: number;
  imageHue: number;
};

const PRODUCT_TEMPLATES: Record<
  CategoryId,
  { name: string; price: number }[]
> = {
  all: [],
  chicken: [
    { name: "허니콤보+콜라1.25L", price: 23000 },
    { name: "황금올리브치킨", price: 19000 },
    { name: "오리지널치킨", price: 17000 },
    { name: "고추바사삭", price: 20000 },
    { name: "양념치킨+콜라", price: 21000 },
    { name: "후라이드+양념 반반", price: 22000 },
    { name: "치즈볼 5개", price: 4500 },
  ],
  pizza: [
    { name: "포테이토피자 (L)", price: 31900 },
    { name: "페퍼로니피자 (M)", price: 22900 },
    { name: "콤비네이션피자 (L)", price: 28900 },
    { name: "치즈피자 (M)", price: 19900 },
    { name: "스테이크피자 (L)", price: 33900 },
  ],
  burger: [
    { name: "빅맥세트", price: 8500 },
    { name: "와퍼세트", price: 9200 },
    { name: "치즈버거", price: 4500 },
    { name: "불고기버거 단품", price: 4900 },
    { name: "싸이버거 세트", price: 7500 },
    { name: "더블치즈버거", price: 6900 },
  ],
  cafe: [
    { name: "아메리카노 Tall", price: 4500 },
    { name: "카페라떼 Tall", price: 5000 },
    { name: "바닐라라떼 Tall", price: 5500 },
    { name: "카라멜마끼아또", price: 5800 },
    { name: "프라푸치노", price: 6300 },
    { name: "그린티라떼", price: 5500 },
    { name: "버블티 레귤러", price: 5200 },
  ],
  convenience: [
    { name: "1만원 교환권", price: 10000 },
    { name: "5천원 교환권", price: 5000 },
    { name: "3천원 교환권", price: 3000 },
    { name: "도시락 교환권", price: 4900 },
    { name: "삼각김밥+음료", price: 3500 },
  ],
  bakery: [
    { name: "1만원 금액권", price: 10000 },
    { name: "케이크 교환권", price: 25000 },
    { name: "도넛 6개입", price: 9500 },
    { name: "샌드위치+음료", price: 6800 },
  ],
  icecream: [
    { name: "패밀리 사이즈", price: 24000 },
    { name: "싱글레귤러", price: 4500 },
    { name: "더블주니어", price: 5500 },
    { name: "쿼터 사이즈", price: 14000 },
  ],
  dining: [
    { name: "디너 1인 식사권", price: 49000 },
    { name: "런치 1인 식사권", price: 32000 },
    { name: "샐러드바 1인", price: 28900 },
    { name: "스테이크 정찬", price: 58000 },
  ],
  department: [
    { name: "신세계 5만원권", price: 50000 },
    { name: "롯데 10만원권", price: 100000 },
    { name: "현대 3만원권", price: 30000 },
    { name: "갤러리아 5만원권", price: 50000 },
  ],
  "mart-voucher": [
    { name: "이마트 3만원권", price: 30000 },
    { name: "홈플러스 5만원권", price: 50000 },
    { name: "롯데마트 1만원권", price: 10000 },
  ],
  fuel: [
    { name: "GS칼텍스 5만원권", price: 50000 },
    { name: "SK에너지 3만원권", price: 30000 },
    { name: "S-OIL 1만원권", price: 10000 },
  ],
  "etc-voucher": [
    { name: "문화상품권 1만원", price: 10000 },
    { name: "도서문화상품권 5천원", price: 5000 },
    { name: "해피머니 3만원", price: 30000 },
    { name: "북앤라이프 1만원", price: 10000 },
  ],
  mart: [
    { name: "이마트 1만원권", price: 10000 },
    { name: "노브랜드 5천원권", price: 5000 },
    { name: "홈플러스 식품권", price: 30000 },
  ],
  health: [
    { name: "올리브영 1만원권", price: 10000 },
    { name: "올리브영 3만원권", price: 30000 },
    { name: "다이소 5천원권", price: 5000 },
  ],
  lifestyle: [
    { name: "다이소 1만원권", price: 10000 },
    { name: "쿠쿠 밥솥 할인쿠폰", price: 50000 },
    { name: "삼성 디지털프라자 5만원권", price: 50000 },
  ],
  book: [
    { name: "교보문고 1만원권", price: 10000 },
    { name: "예스24 5천원권", price: 5000 },
    { name: "알라딘 3만원권", price: 30000 },
  ],
  music: [
    { name: "멜론 30일 이용권", price: 7900 },
    { name: "지니뮤직 1개월권", price: 8400 },
    { name: "벅스 30일권", price: 7900 },
    { name: "스포티파이 프리미엄", price: 11900 },
  ],
  movie: [
    { name: "CGV 2D 영화관람권", price: 13000 },
    { name: "메가박스 일반관람권", price: 12000 },
    { name: "롯데시네마 2매 묶음", price: 24000 },
  ],
  service: [
    { name: "스파 1회 이용권", price: 89000 },
    { name: "두피 마사지", price: 45000 },
    { name: "헤어샵 컷+드라이", price: 38000 },
    { name: "젤네일 1회", price: 45000 },
  ],
  olleh: [
    { name: "olleh tv 1개월권", price: 13000 },
    { name: "olleh wifi 30일권", price: 11000 },
  ],
};

function priceToMileage(price: number): number {
  // 마일리지 ~= 원가의 95% (할인 가정), 100원 단위 절삭
  return Math.floor((price * 0.95) / 100) * 100;
}

// User's current mileage balance (mock).
export const USER_MILEAGE = 124_300;

export type Purchase = {
  id: string;
  product: Product;
  purchasedAt: Date;
  expiresAt: Date;
  used: boolean;
  barcodeNumber: string; // 16 digits, formatted xxxx-xxxx-xxxx-xxxx
  issuer: string;
};

function generateBarcode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const digits = `${hash}${hash * 7}${hash * 13}`
    .replace(/\D/g, "")
    .slice(0, 16)
    .padStart(16, "0");
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
}

export const PRODUCTS: Product[] = (() => {
  const out: Product[] = [];
  let counter = 0;
  for (const cat of CATEGORIES) {
    if (cat.id === "all") continue;
    const brands = CATEGORY_BRANDS[cat.id];
    const templates = PRODUCT_TEMPLATES[cat.id] ?? [];
    if (brands.length === 0 || templates.length === 0) continue;
    for (const brand of brands) {
      for (const tpl of templates) {
        // 브랜드별 가격 변동 (±5%)
        const variance = ((counter % 7) - 3) * 0.02;
        const price = Math.max(
          1000,
          Math.round((tpl.price * (1 + variance)) / 100) * 100,
        );
        out.push({
          id: `g${counter}`,
          name: tpl.name,
          brand,
          category: cat.id,
          price: priceToMileage(price),
          imageHue: (counter * 47) % 360,
        });
        counter += 1;
      }
    }
  }
  return out;
})();

// Sample purchase history (mock). Spread across categories and time.
export const PURCHASES: Purchase[] = (() => {
  // Pick product indices from across the catalog so brands/categories vary.
  const samples: Array<{ idx: number; daysAgo: number }> = [
    { idx: 4, daysAgo: 1 },
    { idx: 18, daysAgo: 3 },
    { idx: 47, daysAgo: 6 },
    { idx: 73, daysAgo: 10 },
    { idx: 102, daysAgo: 14 },
    { idx: 138, daysAgo: 18 },
    { idx: 175, daysAgo: 22 },
    { idx: 214, daysAgo: 27 },
    { idx: 259, daysAgo: 34 },
    { idx: 301, daysAgo: 41 },
    { idx: 347, daysAgo: 52 },
    { idx: 390, daysAgo: 68 },
  ];
  // Use a fixed reference date so server/client render the same dates (no hydration mismatch).
  const reference = new Date("2026-05-11T00:00:00+09:00");
  return samples
    .filter((s) => s.idx < PRODUCTS.length)
    .map((s, i) => {
      const product = PRODUCTS[s.idx];
      const purchasedAt = new Date(reference);
      purchasedAt.setDate(purchasedAt.getDate() - s.daysAgo);
      // 유효기간은 구매일 + 365일
      const expiresAt = new Date(purchasedAt);
      expiresAt.setDate(expiresAt.getDate() + 365);
      // 2주 이상 지난 구매는 대부분 사용됨, 최근 건은 미사용 비중 높음
      const used = s.daysAgo > 14 || (i % 5 === 0 && s.daysAgo > 5);
      const id = `p${i}`;
      return {
        id,
        product,
        purchasedAt,
        expiresAt,
        used,
        barcodeNumber: generateBarcode(id),
        issuer: "KT 알파",
      };
    });
})();

export function getPurchaseById(id: string): Purchase | null {
  return PURCHASES.find((p) => p.id === id) ?? null;
}

export function getProductById(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

// Find products in the same category within a similar price band, excluding the given one.
export function getSimilarProducts(product: Product, limit = 8): Product[] {
  const minPrice = product.price * 0.6;
  const maxPrice = product.price * 1.6;
  return PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      p.category === product.category &&
      p.price >= minPrice &&
      p.price <= maxPrice,
  ).slice(0, limit);
}
