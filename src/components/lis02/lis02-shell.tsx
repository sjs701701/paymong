"use client";

import Image from "next/image";
import {
  CalendarDays,
  Check,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./lis02-shell.module.css";

type ContractStatus = "승인됨" | "검토중" | "반려";
type UsageStatus = "예약" | "송금" | "결제" | "실패";

type UsageRow = {
  date: string;
  status: UsageStatus;
  sender: string;
  amount: string;
};

type Contract = {
  id: number;
  type: string;
  status: ContractStatus;
  name: string;
  amount: string;
};

const contracts: Contract[] = [
  { id: 1, type: "월세 계약", status: "승인됨", name: "강남역 서희스타힐스 502호", amount: "1,200,000" },
  { id: 2, type: "보증금 계약", status: "승인됨", name: "판교 푸르지오 그랑블 101동 1502호", amount: "850,000,000" },
  { id: 3, type: "월세 계약", status: "검토중", name: "여의도 자이 402동 1105호", amount: "1,200,000" },
  { id: 4, type: "보증금 계약", status: "반려", name: "강남역 서희스타힐스 502호", amount: "1,200,000" },
  { id: 5, type: "월세 계약", status: "승인됨", name: "강남역 서희스타힐스 502호", amount: "1,200,000,000" },
  { id: 6, type: "보증금 계약", status: "승인됨", name: "강남역 서희스타힐스 502호", amount: "1,200,000" },
];

const usageRows: UsageRow[] = [
  { date: "2026-04-23", status: "예약", sender: "박대표", amount: "100,000,000원" },
  { date: "2026-04-21", status: "송금", sender: "이사장", amount: "50,000,000원" },
  { date: "2026-04-15", status: "결제", sender: "박대표", amount: "600,000,000원" },
  { date: "2026-04-02", status: "송금", sender: "이사장", amount: "200,000,000원" },
  { date: "2026-04-23", status: "예약", sender: "박대표", amount: "100,000,000원" },
  { date: "2026-04-21", status: "송금", sender: "이사장", amount: "50,000,000원" },
  { date: "2026-04-15", status: "실패", sender: "박대표", amount: "600,000,000원" },
  { date: "2026-04-02", status: "송금", sender: "이사장", amount: "200,000,000원" },
];

const mobileExtraUsageRows: UsageRow[] = [
  { date: "2026-03-28", status: "결제", sender: "김과장", amount: "320,000,000원" },
  { date: "2026-03-19", status: "송금", sender: "최팀장", amount: "75,000,000원" },
  { date: "2026-03-11", status: "예약", sender: "박대표", amount: "180,000,000원" },
  { date: "2026-03-04", status: "송금", sender: "이사장", amount: "40,000,000원" },
  { date: "2026-02-25", status: "결제", sender: "정실장", amount: "520,000,000원" },
  { date: "2026-02-17", status: "실패", sender: "김과장", amount: "90,000,000원" },
  { date: "2026-02-09", status: "송금", sender: "최팀장", amount: "130,000,000원" },
  { date: "2026-01-30", status: "예약", sender: "박대표", amount: "210,000,000원" },
  { date: "2026-01-21", status: "결제", sender: "정실장", amount: "450,000,000원" },
  { date: "2026-01-08", status: "송금", sender: "이사장", amount: "60,000,000원" },
];

const mobileUsageRows = [...usageRows, ...mobileExtraUsageRows];

const menuGroups = [
  { title: "계약·정산", items: ["계약 리스트", "계약 등록하기", "마일리지 샵", "세금계산서 / 부가세 신고"] },
  { title: "게시판", items: ["자주하는 질문", "공지사항", "이벤트", "페이몽 매거진", "이용 가이드"] },
  { title: "계정 및 앱", items: ["SNS 간편 로그인 연결", "앱 다운로드"] },
];

export function Lis02Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [excludeApproved, setExcludeApproved] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [draftDateFrom, setDraftDateFrom] = useState(dateFrom);
  const [draftDateTo, setDraftDateTo] = useState(dateTo);

  useEffect(() => {
    if (!dateModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDateModalOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [dateModalOpen]);

  const filteredContracts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return contracts.filter((contract) => {
      if (excludeApproved && contract.status === "승인됨") return false;
      return !keyword || contract.name.toLowerCase().includes(keyword);
    });
  }, [excludeApproved, query]);

  const openDateModal = () => {
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setDateModalOpen(true);
  };

  const applyDateRange = () => {
    if (!draftDateFrom || !draftDateTo || draftDateFrom > draftDateTo) return;
    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setDateModalOpen(false);
  };

  const dateRangeLabel = `${dateFrom.slice(5).replace("-", ".")} ~ ${dateTo.slice(5).replace("-", ".")}`;

  return (
    <div className={styles.screen}>
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((current) => !current)} />
      {menuOpen ? <UserMenu onClose={() => setMenuOpen(false)} /> : null}

      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <h1>계약 리스트</h1>
          <label className={styles.searchBox}>
            <Search size={16} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="계약명을 검색해보세요" />
          </label>
          <div className={styles.filterRow}>
            <span>전체 <b>{filteredContracts.length}</b></span>
            <label className={styles.excludeCheck}>
              <input type="checkbox" checked={excludeApproved} onChange={(event) => setExcludeApproved(event.target.checked)} />
              <span className={styles.checkVisual}><Check size={11} strokeWidth={3} /></span>
              승인된 계약 제외
            </label>
          </div>
        </div>

        <ul className={styles.contractList}>
          {filteredContracts.map((contract) => (
            <li key={contract.id} className={`${styles.contractItem} ${contract.id === 1 ? styles.selectedContract : ""}`}>
              <button type="button">
                <div className={styles.contractHead}>
                  <span>{contract.type}</span>
                  <em data-status={contract.status}>{contract.status}</em>
                </div>
                <strong>{contract.name}</strong>
                <div className={styles.contractFoot}>
                  <span>계약 금액</span>
                  <b>{contract.amount}<small>원</small></b>
                  <ChevronRight size={15} />
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.registerFooter}>
          <button type="button"><Plus size={17} /> 계약 등록하기</button>
        </div>
      </aside>

      <section className={styles.detail}>
        <div className={styles.desktopTitleBar}>
          <button type="button" aria-label="뒤로가기" onClick={() => window.history.back()}><ChevronLeft /></button>
          <h2>강남역 서희스타힐스 502호</h2>
          <span className={styles.metaDivider} />
          <span>우리은행</span>
          <b>100212345678</b>
          <span className={styles.metaDivider} />
          <span>예금주</span>
          <b>옐스관리</b>
        </div>

        <main className={styles.detailBody}>
          <UsageCard
            page={page}
            onPageChange={setPage}
            dateRangeLabel={dateRangeLabel}
            onDateOpen={openDateModal}
          />
          <LimitCard />
        </main>
      </section>

      {dateModalOpen ? (
        <DateRangeModal
          dateFrom={draftDateFrom}
          dateTo={draftDateTo}
          onDateFromChange={setDraftDateFrom}
          onDateToChange={setDraftDateTo}
          onClose={() => setDateModalOpen(false)}
          onApply={applyDateRange}
        />
      ) : null}

      <div className={`${styles.mobilePayFooter} modu-mobile-sticky-action`}>
        <button type="button"><WalletCards size={16} strokeWidth={2.2} />결제하기</button>
      </div>
    </div>
  );
}

function Header({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <button className={styles.mobileBack} type="button" aria-label="뒤로가기" onClick={() => window.history.back()}>
          <ChevronLeft size={24} />
        </button>
        <Image className={styles.logo} src="/brand/paymong-header-logo.svg" alt="Paymong" width={148} height={26} priority />
        <div className={styles.mobileTitle}>
          <strong>강남역 서희스타힐스 502호</strong>
          <span>우리은행 <i>·</i> 100212345678 <i>·</i> 예금주 옐스관리</span>
        </div>
        <button className={styles.menuButton} type="button" aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} onClick={onMenuToggle}>
          <span>김민수 님</span>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

function UserMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.menuOverlay} onClick={onClose}>
      <nav className={styles.userMenu} aria-label="사용자 메뉴" onClick={(event) => event.stopPropagation()}>
        <div className={styles.userInfo}>
          <div><strong>홍길동</strong><span>010-1234-5678</span></div>
          <button type="button" aria-label="설정"><Settings size={19} /></button>
        </div>
        {menuGroups.map((group) => (
          <div className={styles.menuGroup} key={group.title}>
            <h3>{group.title}</h3>
            {group.items.map((item, index) => (
              <button type="button" key={item} className={item === "계약 리스트" ? styles.currentMenu : ""}>
                <span>{item}</span>{item === "계약 리스트" && index === 0 ? <em>현재</em> : null}
              </button>
            ))}
          </div>
        ))}
        <button className={styles.logout} type="button">로그아웃</button>
      </nav>
    </div>
  );
}

function LimitCard() {
  return (
    <section className={styles.limitCard}>
      <div className={styles.limitHead}>
        <span>6월 사용 가능 한도</span>
        <em><RefreshCw size={12} />매월 1일 초기화</em>
      </div>
      <h3>600,000,000 <span>원</span></h3>
      <div className={styles.progressLabel}><b>50%</b> 사용중</div>
      <div className={styles.progressTrack}><span /></div>
      <div className={styles.limitInfo}>
        <div><span>사용금액</span><b>600,000,000원</b></div>
        <div><span>전체 한도</span><b>1,200,000,000원</b></div>
      </div>
      <button className={styles.desktopPayButton} type="button"><WalletCards size={16} strokeWidth={2.2} />결제하기</button>
    </section>
  );
}

function UsageCard({
  page,
  onPageChange,
  dateRangeLabel,
  onDateOpen,
}: {
  page: number;
  onPageChange: (page: number) => void;
  dateRangeLabel: string;
  onDateOpen: () => void;
}) {
  const [mobileVisibleCount, setMobileVisibleCount] = useState(4);
  const mobileLoadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMoreTarget = mobileLoadMoreRef.current;
    if (!loadMoreTarget || mobileVisibleCount >= mobileUsageRows.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMobileVisibleCount((current) => Math.min(current + 4, mobileUsageRows.length));
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(loadMoreTarget);
    return () => observer.disconnect();
  }, [mobileVisibleCount]);

  const hasMoreMobileRows = mobileVisibleCount < mobileUsageRows.length;

  return (
    <section className={styles.usageCard}>
      <div className={styles.usageHead}>
        <h3>사용 내역</h3>
        <div className={styles.desktopDates}>
          <CalendarDays size={15} />
          <span>조회기간</span>
          <input aria-label="조회 시작일" type="date" defaultValue="2026-05-01" />
          <i>~</i>
          <input aria-label="조회 종료일" type="date" defaultValue="2026-05-31" />
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryValues}>
          <div><span>총 이용 금액</span><strong>1,750,000,000<small>원</small></strong></div>
          <i />
          <div><span>총 건수</span><strong>8<small>건</small></strong></div>
        </div>
        <button type="button"><FileSpreadsheet size={15} strokeWidth={2.2} />엑셀 다운로드</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.mobileUsageHead}>
          <h3>이용 내역</h3>
          <button type="button" onClick={onDateOpen}>
            <CalendarDays size={14} />
            <span>{dateRangeLabel}</span>
          </button>
        </div>
        <table>
          <colgroup><col style={{ width: "24%" }} /><col style={{ width: "18%" }} /><col style={{ width: "22%" }} /><col /></colgroup>
          <thead><tr><th>이용일</th><th>상태</th><th>송금자</th><th>이용 금액</th></tr></thead>
          <tbody className={styles.mobileTableBody}>
            <UsageTableRows rows={mobileUsageRows.slice(0, mobileVisibleCount)} />
          </tbody>
          <tbody className={styles.desktopTableBody}>
            <UsageTableRows rows={usageRows} />
          </tbody>
        </table>
        <div ref={mobileLoadMoreRef} className={styles.mobileLoadMore} aria-live="polite">
          {hasMoreMobileRows ? (
            <><span className={styles.loadingSpinner} />내역을 불러오는 중</>
          ) : (
            "모든 이용 내역을 불러왔습니다."
          )}
        </div>
        <div className={styles.pagination}>
          <button type="button" aria-label="처음" onClick={() => onPageChange(1)}><ChevronFirst /></button>
          <button type="button" aria-label="이전" onClick={() => onPageChange(Math.max(1, page - 1))}><ChevronLeft /></button>
          {[1, 2, 3, 4, 5].map((item) => <button key={item} type="button" className={page === item ? styles.currentPage : ""} onClick={() => onPageChange(item)}>{item}</button>)}
          <button type="button" aria-label="다음" onClick={() => onPageChange(Math.min(5, page + 1))}><ChevronRight /></button>
          <button type="button" aria-label="끝" onClick={() => onPageChange(5)}><ChevronLast /></button>
        </div>
      </div>
    </section>
  );
}

function UsageTableRows({ rows }: { rows: UsageRow[] }) {
  return rows.map((row, index) => (
    <tr key={`${row.date}-${row.status}-${index}`}>
      <td>{row.date}</td>
      <td><span className={styles.status} data-status={row.status}>{row.status}</span></td>
      <td>{row.sender}</td>
      <td><b>{row.amount}</b><ChevronRight size={13} /></td>
    </tr>
  ));
}

function DateRangeModal({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClose,
  onApply,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const isInvalid = !dateFrom || !dateTo || dateFrom > dateTo;

  return (
    <div className={styles.dateModalBackdrop} onClick={onClose}>
      <section
        className={styles.dateModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-range-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.dateModalHead}>
          <div>
            <h2 id="date-range-title">조회기간 설정</h2>
            <p>이용 내역을 확인할 기간을 선택해주세요.</p>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.dateFields}>
          <label>
            <span>시작일</span>
            <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
          </label>
          <i>~</i>
          <label>
            <span>종료일</span>
            <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
          </label>
        </div>

        {dateFrom && dateTo && dateFrom > dateTo ? (
          <p className={styles.dateError}>종료일은 시작일보다 빠를 수 없습니다.</p>
        ) : null}

        <div className={styles.dateModalActions}>
          <button type="button" onClick={onClose}>취소</button>
          <button type="button" disabled={isInvalid} onClick={onApply}>적용하기</button>
        </div>
      </section>
    </div>
  );
}
