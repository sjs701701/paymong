"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";
import { motion, useReducedMotion } from "framer-motion";

type FourthSectionCard = {
  id: string;
  title: string;
  description: string;
  accent: string;
  surface: string;
  media: {
    kind: "image" | "lottie" | "physics";
    src: string;
  };
};

const FOURTH_SECTION_CARDS: FourthSectionCard[] = [
  {
    id: "onboarding",
    title: "20XX년부터 이어온 페이몽",
    description: "서비스 시작 이후 현재까지 00,000건 이상의 계약을 문제없이 진행해왔습니다.",
    accent: "#407CFF",
    surface: "linear-gradient(180deg, rgba(64, 124, 255, 0.18) 0%, rgba(64, 124, 255, 0.06) 100%)",
    media: {
      kind: "image",
      src: "/design/fourth-section/card-1-timeline.svg",
    },
  },
  {
    id: "review",
    title: "다양한 계약도<br>유연하게",
    description: "월세, 교육비, 인건비, 이사비 등 다양한 유형의 계약 비용을 페이몽으로 진행할 수 있습니다.",
    accent: "#73DAFF",
    surface: "linear-gradient(180deg, rgba(115, 218, 255, 0.2) 0%, rgba(115, 218, 255, 0.07) 100%)",
    media: {
      kind: "physics",
      src: "/design/fourth-section/physics-icons/physics-icon-1.png",
    },
  },
  {
    id: "settlement",
    title: "신뢰를 뒷받침하는<br>안전장치",
    description: "서울보증보험 지급보증을 기반으로, 모든 거래를 더욱 안전하고 투명하게 관리합니다.",
    accent: "#BE8BFF",
    surface: "linear-gradient(180deg, rgba(190, 139, 255, 0.2) 0%, rgba(190, 139, 255, 0.07) 100%)",
    media: {
      kind: "lottie",
      src: "/design/fourth-section/card-3-lottie.json",
    },
  },
] as const;

const ODOMETER_DIGITS = Array.from({ length: 10 }, (_, index) => index);
const ODOMETER_TARGET = "25,000";
const PHYSICS_ICON_TEXTURES = [
  "/design/fourth-section/physics-icons/physics-icon-1.png",
  "/design/fourth-section/physics-icons/physics-icon-2.png",
  "/design/fourth-section/physics-icons/physics-icon-3.png",
  "/design/fourth-section/physics-icons/physics-icon-4.png",
  "/design/fourth-section/physics-icons/physics-icon-5.png",
] as const;

function renderMultilineText(value: string) {
  return value.split("<br>").map((part, index, parts) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? <br /> : null}
    </span>
  ));
}

function PublicLottie({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAnimation = async () => {
      try {
        const response = await fetch(src);

        if (!response.ok) {
          throw new Error(`Failed to load ${src}`);
        }

        const data = await response.json();

        if (!isCancelled) {
          setAnimationData(data);
        }
      } catch {
        if (!isCancelled) {
          setAnimationData(null);
        }
      }
    };

    loadAnimation();

    return () => {
      isCancelled = true;
    };
  }, [src]);

  if (!animationData) {
    return null;
  }

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
}

function PhysicsDropMedia({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const hostCard = container.closest(".fourth-proof-card--physics");

    if (!(hostCard instanceof HTMLElement)) {
      return;
    }

    let isCancelled = false;
    let dropInterval: ReturnType<typeof setInterval> | null = null;
    let renderCleanup = () => {};

    const loadTextures = async () => {
      const loaded = await Promise.all(
        PHYSICS_ICON_TEXTURES.map(
          (src) =>
            new Promise<{ src: string; width: number; height: number }>((resolve) => {
              const image = new Image();
              image.onload = () =>
                resolve({
                  src,
                  width: image.naturalWidth || 120,
                  height: image.naturalHeight || 120,
                });
              image.onerror = () =>
                resolve({
                  src,
                  width: 120,
                  height: 120,
                });
              image.src = src;
            }),
        ),
      );

      return loaded;
    };

    const initialize = async () => {
      const Matter = await import("matter-js");
      const textures = await loadTextures();

      if (isCancelled || !container) {
        return;
      }

      const { Engine, Render, Runner, Bodies, Composite, Events, Vector, Body } = Matter;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const engine = Engine.create();
      const render = Render.create({
        element: container,
        engine,
        options: {
          width,
          height,
          background: "transparent",
          wireframes: false,
          pixelRatio: 1,
        },
      });
      const runner = Runner.create();

      const wallOptions = { isStatic: true, render: { visible: false } };
      const ground = Bodies.rectangle(width / 2, height + 14, width + 120, 28, wallOptions);
      const leftWall = Bodies.rectangle(-10, height / 2, 20, height + 120, wallOptions);
      const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height + 120, wallOptions);
      const ceiling = Bodies.rectangle(width / 2, -120, width + 120, 24, wallOptions);

      Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

      const hoverPointer = {
        active: false,
        x: -9999,
        y: -9999,
      };

      const updateHoverPointer = (event: MouseEvent) => {
        const rect = hostCard.getBoundingClientRect();
        hoverPointer.active = true;
        hoverPointer.x = event.clientX - rect.left;
        hoverPointer.y = event.clientY - rect.top;
      };

      const resetHoverPointer = () => {
        hoverPointer.active = false;
        hoverPointer.x = -9999;
        hoverPointer.y = -9999;
      };

      const applyHoverForce = () => {
        if (reducedMotion || !hoverPointer.active) {
          return;
        }

        const bodies = Composite.allBodies(engine.world);

        bodies.forEach((body) => {
          if (body.isStatic) return;

          const pointerPosition = {
            x: hoverPointer.x,
            y: hoverPointer.y,
          };
          const distance = Vector.magnitude(Vector.sub(body.position, pointerPosition));

          if (distance < 68) {
            const forceDirection = Vector.normalise(Vector.sub(body.position, pointerPosition));
            const forceMagnitude = 0.0029 * body.mass;
            Body.applyForce(body, body.position, Vector.mult(forceDirection, forceMagnitude));
          }
        });
      };

      Events.on(engine, "beforeUpdate", applyHoverForce);

      const createSpawnQueue = (totalIcons: number) => {
        const queue: { src: string; width: number; height: number }[] = [];

        while (queue.length < totalIcons) {
          const shuffled = [...textures].sort(() => Math.random() - 0.5);
          queue.push(...shuffled);
        }

        return queue.slice(0, totalIcons);
      };

      const startDrop = () => {
        if (hasStartedRef.current) {
          return;
        }

        hasStartedRef.current = true;
        Render.run(render);
        Runner.run(runner, engine);

        let count = 0;
        const totalIcons = reducedMotion ? 8 : 18;
        const spawnQueue = createSpawnQueue(totalIcons);

        dropInterval = setInterval(() => {
          if (count >= totalIcons) {
            if (dropInterval) {
              clearInterval(dropInterval);
              dropInterval = null;
            }
            return;
          }

          const queuedTexture = spawnQueue[count];
          Composite.add(engine.world, createObjectFromTexture(queuedTexture));
          count += 1;
        }, reducedMotion ? 145 : 90);
      };

      const createObjectFromTexture = (texture: { src: string; width: number; height: number }) => {
        const x = Math.random() * (width - 88) + 44;
        const y = -80;
        const targetSize = (Math.random() * 18 + 46) * 1.38;
        const scale = targetSize / Math.max(texture.width, texture.height);

        return Bodies.circle(x, y, targetSize * 0.44, {
          restitution: 0.3,
          friction: 0.08,
          frictionAir: 0.016,
          density: 0.0012,
          render: {
            sprite: {
              texture: texture.src,
              xScale: scale,
              yScale: scale,
            },
          },
        });
      };

      hostCard.addEventListener("mousemove", updateHoverPointer);
      hostCard.addEventListener("mouseleave", resetHoverPointer);
      hostCard.addEventListener("mouseenter", startDrop, { once: true });

      renderCleanup = () => {
        if (dropInterval) {
          clearInterval(dropInterval);
        }
        hostCard.removeEventListener("mousemove", updateHoverPointer);
        hostCard.removeEventListener("mouseleave", resetHoverPointer);
        hostCard.removeEventListener("mouseenter", startDrop);
        Events.off(engine, "beforeUpdate", applyHoverForce);
        Render.stop(render);
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        render.canvas.remove();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (render as any).textures = {};
        container.innerHTML = "";
      };
    };

    initialize();

    return () => {
      isCancelled = true;
      renderCleanup();
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className="fourth-proof-card__physics-layer" aria-hidden="true" />;
}

function OdometerDigit({
  digit,
  isActive,
  order,
}: {
  digit: number;
  isActive: boolean;
  order: number;
}) {
  const repeatedDigits = useMemo(
    () => Array.from({ length: 80 }, (_, repeatIndex) => ODOMETER_DIGITS[repeatIndex % 10]),
    [],
  );
  const targetIndex = 20 + digit;

  return (
    <span className="fourth-proof-odometer__digit" aria-hidden="true">
      <span
        className="fourth-proof-odometer__digit-track"
        style={{
          transform: isActive
            ? `translateY(calc(-1em * ${targetIndex}))`
            : "translateY(0)",
          transitionDelay: `${order * 80}ms`,
        }}
      >
        {repeatedDigits.map((value, index) => (
          <span key={`${order}-${index}`} className="fourth-proof-odometer__digit-cell">
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

function OdometerNumber({
  value,
  isActive,
}: {
  value: string;
  isActive: boolean;
}) {
  return (
    <span className="fourth-proof-odometer" aria-label={value}>
      {value.split("").map((char, index) => {
        if (char === ",") {
          return (
            <span key={`comma-${index}`} className="fourth-proof-odometer__comma">
              ,
            </span>
          );
        }

        const currentOrder = value
          .slice(0, index)
          .split("")
          .filter((token) => token !== ",")
          .length;

        return (
          <OdometerDigit
            key={`digit-${index}`}
            digit={Number(char)}
            isActive={isActive}
            order={currentOrder}
          />
        );
      })}
    </span>
  );
}

export function FourthSection() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isOdometerActive, setIsOdometerActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsOdometerActive(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-two-onward-font fourth-proof-section relative z-40 overflow-hidden px-6 py-20 sm:px-10 sm:py-24 lg:px-20 lg:py-28"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 lg:gap-16">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center text-center">
          <h2 className="fourth-proof-section__headline text-[clamp(2.8rem,7vw,6.8rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-[var(--text-primary)]">
            <span className="fourth-proof-section__headline-line">
              <OdometerNumber value={ODOMETER_TARGET} isActive={isOdometerActive} />
              <span className="fourth-proof-section__headline-copy"> 번 이상 진행된 계약</span>
            </span>
            <span className="fourth-proof-section__headline-line">증명된 페이몽</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FOURTH_SECTION_CARDS.map((card, index) => (
            <motion.article
              key={card.id}
              className={`fourth-proof-card ${card.media.kind === "physics" ? "fourth-proof-card--physics" : ""}`}
              style={{
                ["--fourth-card-accent" as string]: card.accent,
                ["--fourth-card-surface" as string]: card.surface,
              }}
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={reducedMotion ? undefined : { y: -10 }}
            >
              {card.media.kind === "physics" ? <PhysicsDropMedia reducedMotion={reducedMotion} /> : null}

              <div className="fourth-proof-card__content">
                <div className="fourth-proof-card__copy">
                  <h3 className="fourth-proof-card__title">{renderMultilineText(card.title)}</h3>
                  <p className="fourth-proof-card__description">{card.description}</p>
                </div>

                <div
                  className={`fourth-proof-card__media ${
                    card.media.kind === "physics" ? "fourth-proof-card__media--hidden" : ""
                  }`}
                >
                  {card.media.kind === "image" ? (
                    <img
                      src={card.media.src}
                      alt=""
                      className="fourth-proof-card__image"
                      aria-hidden="true"
                    />
                  ) : (
                    <PublicLottie src={card.media.src} className="fourth-proof-card__lottie" />
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
