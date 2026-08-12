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
import { useMemo, useState } from "react";

import styles from "./lis02-shell.module.css";

type ContractStatus = "승인됨" | "검토중" | "반려";
type UsageStatus = "예약" | "송금" | "결제" | "실패";

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

const usageRows: Array<{
  date: string;
  status: UsageStatus;
  sender: string;
  amount: string;
}> = [
  { date: "2026-04-23", status: "예약", sender: "박대표", amount: "100,000,000원" },
  { date: "2026-04-21", status: "송금", sender: "이사장", amount: "50,000,000원" },
  { date: "2026-04-15", status: "결제", sender: "박대표", amount: "600,000,000원" },
  { date: "2026-04-02", status: "송금", sender: "이사장", amount: "200,000,000원" },
  { date: "2026-04-23", status: "예약", sender: "박대표", amount: "100,000,000원" },
  { date: "2026-04-21", status: "송금", sender: "이사장", amount: "50,000,000원" },
  { date: "2026-04-15", status: "실패", sender: "박대표", amount: "600,000,000원" },
  { date: "2026-04-02", status: "송금", sender: "이사장", amount: "200,000,000원" },
];

const menuGroups = [
  { title: "계약·정산", items: ["계약 리스트", "계약 등록하기", "마일리지 샵", "세금계산서 / 부가세 신고"] },
  { title: "게시판", items: ["자주하는 질문", "공지사항", "이벤트", "페이몽 매거진", "이용 가이드"] },
  { title: "계정 및 앱", items: ["SNS 간편 로그인 연결", "앱 다운로드"] },
];

export function Lis02Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState("1주");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [excludeApproved, setExcludeApproved] = useState(false);

  const filteredContracts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return contracts.filter((contract) => {
      if (excludeApproved && contract.status === "승인됨") return false;
      return !keyword || contract.name.toLowerCase().includes(keyword);
    });
  }, [excludeApproved, query]);

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
          <PeriodSelector period={period} onChange={setPeriod} />
          <UsageCard page={page} onPageChange={setPage} />
          <LimitCard />
        </main>
      </section>

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

function PeriodSelector({ period, onChange }: { period: string; onChange: (period: string) => void }) {
  const periods = ["1주", "1달", "1년", "직접 입력"];
  return (
    <div className={styles.periodWrap}>
      <div className={styles.periodTabs}>
        {periods.map((item) => (
          <button key={item} type="button" className={period === item ? styles.activePeriod : ""} onClick={() => onChange(item)}>{item}</button>
        ))}
      </div>
      <div className={`${styles.customDates} ${period === "직접 입력" ? styles.showDates : ""}`}>
        <CalendarDays size={15} />
        <input aria-label="조회 시작일" type="date" defaultValue="2026-05-01" />
        <span>~</span>
        <input aria-label="조회 종료일" type="date" defaultValue="2026-05-31" />
      </div>
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

function UsageCard({ page, onPageChange }: { page: number; onPageChange: (page: number) => void }) {
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
        <table>
          <colgroup><col style={{ width: "24%" }} /><col style={{ width: "18%" }} /><col style={{ width: "22%" }} /><col /></colgroup>
          <thead><tr><th>이용일</th><th>상태</th><th>송금자</th><th>이용 금액</th></tr></thead>
          <tbody>
            {usageRows.map((row, index) => (
              <tr key={`${row.date}-${index}`}>
                <td>{row.date}</td>
                <td><span className={styles.status} data-status={row.status}>{row.status}</span></td>
                <td>{row.sender}</td>
                <td><b>{row.amount}</b><ChevronRight size={13} /></td>
              </tr>
            ))}
          </tbody>
        </table>
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
