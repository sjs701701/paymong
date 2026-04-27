"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "페이몽에서는 어떤 계약 비용을 진행할 수 있나요?",
    answer: "월세, 교육비, 인건비, 이사비처럼 성격이 다른 계약 비용도 동일한 흐름 안에서 등록하고 진행할 수 있도록 설계한 FAQ 예시입니다.",
  },
  {
    question: "계약 등록 이후 확인과 송금은 어떻게 이어지나요?",
    answer: "계약서와 증빙 자료 검토가 끝나면 승인 단계로 넘어가고, 이후 송금 요청과 처리 단계가 한 화면 안에서 이어지는 구조를 상정하고 있습니다.",
  },
  {
    question: "보증 체계와 안전장치는 어떻게 설명되나요?",
    answer: "서울보증보험 지급보증처럼 거래 흐름을 보완하는 체계를 기반으로, 거래가 끝까지 안전하게 관리된다는 메시지를 전달하는 더미 답변입니다.",
  },
  {
    question: "계약 진행 상태를 다시 확인할 수 있나요?",
    answer: "요청 접수, 검토, 승인, 송금 처리처럼 각 단계를 순서대로 다시 확인할 수 있는 운영 화면을 염두에 둔 예시 카피입니다.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section
      data-faq-section-root
      className="section-two-onward-font hero-video-stage-background relative z-40 px-5 py-16 text-slate-950 sm:px-8 sm:py-24 lg:px-16 lg:py-32"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 sm:gap-14 lg:flex-row lg:gap-24">
        <div className="lg:w-[34%]">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
            <span className="text-sm font-medium text-slate-500 sm:text-base">Any questions?</span>
          </div>
          <h2 className="text-[clamp(2.8rem,8vw,7rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-slate-950 sm:leading-[0.9]">
            FAQ
          </h2>
          <p className="mt-4 max-w-[22rem] text-[0.95rem] leading-[1.7] text-slate-500 sm:mt-6 sm:text-base sm:leading-[1.8] lg:text-lg">
            계약 진행 흐름과 안전장치에 대해 자주 묻는 질문들을 보다 읽기 쉬운 텍스트로 정리한 섹션입니다.
          </p>
        </div>

        <div className="flex w-full max-w-4xl flex-col gap-4 lg:w-[66%]">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className={`rounded-[1.4rem] border px-5 py-4 transition-all duration-300 sm:rounded-[1.8rem] sm:px-6 sm:py-5 ${
                  isOpen
                    ? "border-transparent bg-white shadow-[0_18px_40px_rgba(10,15,30,0.07)]"
                    : "border-black/10 bg-transparent hover:border-transparent hover:bg-white/80 hover:shadow-[0_14px_30px_rgba(10,15,30,0.05)]"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left sm:gap-6"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="pr-2 text-[0.98rem] font-medium leading-[1.45] text-slate-900 sm:pr-6 sm:text-[1.2rem]">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-11 sm:w-11 ${
                      isOpen
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-black/12 bg-transparent text-slate-700"
                    }`}
                  >
                    {isOpen ? <Minus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> : <Plus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />}
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ${
                    isOpen ? "mt-3 grid-rows-[1fr] opacity-100 sm:mt-4" : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[44rem] text-[0.92rem] leading-[1.7] text-slate-500 sm:text-[1rem] sm:leading-[1.8]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
