"use client";

export function FooterSection() {
  return (
    <footer className="section-two-onward-font relative z-40 border-t border-black/6 bg-white px-5 py-10 text-slate-900 sm:px-8 sm:py-12 lg:px-16 lg:py-14">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 sm:gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[clamp(1.85rem,4vw,3.4rem)] font-semibold tracking-[-0.08em] text-slate-950">
            Paymong
          </div>
          <p className="mt-3 max-w-[28rem] text-[0.85rem] leading-[1.7] text-slate-500 sm:text-sm sm:leading-[1.8] lg:text-[0.98rem]">
            계약 진행부터 승인, 송금, 이후 운영 단계까지 더 단단하게 정리하는 흐름을 위한 랜딩 마무리 푸터입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 text-[0.85rem] text-slate-500 sm:grid-cols-3 sm:gap-10 sm:text-sm">
          <div>
            <div className="mb-1.5 font-semibold uppercase tracking-[0.18em] text-slate-300 sm:mb-2">Company</div>
            <div className="space-y-1 sm:space-y-1.5">
              <p>Paymong Inc.</p>
              <p>서울특별시 강남구 테헤란로</p>
              <p>Business demo footer</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 font-semibold uppercase tracking-[0.18em] text-slate-300 sm:mb-2">Contact</div>
            <div className="space-y-1 sm:space-y-1.5">
              <p>hello@paymong.com</p>
              <p>02-0000-0000</p>
              <p>평일 09:00 - 18:00</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 font-semibold uppercase tracking-[0.18em] text-slate-300 sm:mb-2">Policy</div>
            <div className="space-y-1 sm:space-y-1.5">
              <p>이용약관</p>
              <p>개인정보처리방침</p>
              <p>전자금융거래약관</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
