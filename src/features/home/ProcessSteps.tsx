"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { TempleBellsDivider } from "@/shared/ui/heritage-ornaments"
import { cn } from "@/shared/utils"

export interface ProcessStep {
  id: string
  stepNumber: string
  title: string
  subtitle: string
  description: string
  cfUrl: string
  cfId: string
  localPath: string
  badge: string
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "step-01",
    stepNumber: "01",
    title: "Fabric Selection",
    subtitle: "Pure Cotton & Silk Foundations",
    description:
      "We select high-quality cotton or silk fabric that is durable, breathable and ideal for hand-painting.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/0e184c1e-9de9-4cde-da07-25cc06118300/full",
    cfId: "0e184c1e-9de9-4cde-da07-25cc06118300",
    localPath: "/images/process/step-01-fabric-selection.jpg",
    badge: "Cotton & Silk",
  },
  {
    id: "step-02",
    stepNumber: "02",
    title: "Washing & Scouring",
    subtitle: "Natural Purification in Flowing Waters",
    description:
      "The fabric is thoroughly washed to remove starch, oils and impurities, making it ready for traditional treatment.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/57979095-539c-4fbd-8bd6-e98070848700/full",
    cfId: "57979095-539c-4fbd-8bd6-e98070848700",
    localPath: "/images/process/step-02-washing-scouring.jpg",
    badge: "River Washed",
  },
  {
    id: "step-03",
    stepNumber: "03",
    title: "Myrobalan & Milk Treatment",
    subtitle: "Traditional Mordant & Tannin Bath",
    description:
      "The fabric is soaked in a mixture of myrobalan (haritaki) and buffalo milk. This traditional treatment helps the fabric absorb dyes better and gives a smooth, durable base.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/401c6950-4ece-4bb0-72f0-b6078fcffe00/full",
    cfId: "401c6950-4ece-4bb0-72f0-b6078fcffe00",
    localPath: "/images/process/step-03-myrobalan-milk-treatment.jpg",
    badge: "Haritaki Soak",
  },
  {
    id: "step-04",
    stepNumber: "04",
    title: "Drying & Preparation",
    subtitle: "Shade Curing for Sacred Artistry",
    description:
      "The treated fabric is dried in the shade and prepared for hand-drawing. This ensures the fabric is ready to absorb natural colours evenly.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/e55d2c90-7c0a-40ab-1854-dbced0706500/full",
    cfId: "e55d2c90-7c0a-40ab-1854-dbced0706500",
    localPath: "/images/process/step-04-drying-preparation.jpg",
    badge: "Shade Dried",
  },
  {
    id: "step-06",
    stepNumber: "06",
    title: "Preparing Natural Colours",
    subtitle: "Earth, Bark, Minerals & Indigo",
    description:
      "Colours are prepared from natural sources like indigo, madder, pomegranate rind, turmeric and other plant materials. These eco-friendly dyes give Kalamkari its rich and timeless shades.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/042449ab-4f24-4b72-c50d-e6660d035700/full",
    cfId: "042449ab-4f24-4b72-c50d-e6660d035700",
    localPath: "/images/process/step-06-preparing-natural-colours.jpg",
    badge: "100% Plant Dyes",
  },
  {
    id: "step-08a",
    stepNumber: "08A",
    title: "Filling in Colours (Painting)",
    subtitle: "Hand-Painting with the Bamboo Kalam",
    description:
      "The outlined designs are carefully filled with natural colours using a Kalam (bamboo pen) or brush. Artisans apply each colour by hand with great precision and patience.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/6ee548b2-e9a6-498a-0516-3085d7ff5100/full",
    cfId: "6ee548b2-e9a6-498a-0516-3085d7ff5100",
    localPath: "/images/process/step-08a-filling-in-colours.jpg",
    badge: "Hand Painted",
  },
  {
    id: "step-08b",
    stepNumber: "08B",
    title: "Washing for Clarity",
    subtitle: "Washing Off Excess Dye in Flowing Waters",
    description:
      "The fabric is thoroughly washed in clean water, often in flowing river water, to remove excess dye. This step reveals the clarity of the design and prepares the fabric.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/45a9e45e-e00e-42fb-bd4e-402e3d9fe800/full",
    cfId: "45a9e45e-e00e-42fb-bd4e-402e3d9fe800",
    localPath: "/images/process/step-08b-washing-off-excess-dye.jpg",
    badge: "Flowing Water",
  },
  {
    id: "step-08c",
    stepNumber: "08C",
    title: "Washing & Finishing",
    subtitle: "Sun-Dried Sacred Lustre",
    description:
      "After dyeing, the fabric is thoroughly washed in clean water to remove excess dye and fixed properly. The cloth is then sun-dried and finished for a soft, vibrant and long-lasting look.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/e32ae0ec-7698-49d6-93c3-2c0e980bfe00/full",
    cfId: "e32ae0ec-7698-49d6-93c3-2c0e980bfe00",
    localPath: "/images/process/step-08c-washing-and-finishing.jpg",
    badge: "Sun Finished",
  },
  {
    id: "step-overview",
    stepNumber: "★",
    title: "The 10-Step Heritage Journey",
    subtitle: "Complete Master Infographic Overview",
    description:
      "From raw cotton selection to freehand kalam detailing and final inspection: More than a saree — a living heritage of India woven across generations.",
    cfUrl:
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/3d8fb749-2b22-406a-ed45-874dcd9d6400/full",
    cfId: "3d8fb749-2b22-406a-ed45-874dcd9d6400",
    localPath: "/images/process/process-overview-10-steps.jpg",
    badge: "Master Overview",
  },
]

// Legacy export compatibility
export const PROCESS_IMAGES = PROCESS_STEPS.map((step) => ({
  src: step.cfUrl,
  alt: `${step.stepNumber} ${step.title}`,
}))

const SWIPE_DISTANCE = 60

// The source pictures are only 1024px wide. These are upscaled and sharpened
// copies so they hold up on large and high-density screens.
const sharpSrc = (step: ProcessStep) =>
  `/images/process/hd/${step.localPath.split("/").pop()?.replace(/\.jpg$/, ".webp")}`

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--brand-midnight))]"

const stageVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -48 }),
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--brand-gold)/0.7)] text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
        focusRing,
      )}
    >
      {children}
    </button>
  )
}

export function ProcessSteps() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [zoomed, setZoomed] = useState(false)
  const reduceMotion = useReducedMotion()

  const total = PROCESS_STEPS.length
  const step = PROCESS_STEPS[index]

  const goTo = useCallback(
    (next: number) => {
      const target = Math.min(total - 1, Math.max(0, next))
      if (target === index) return
      setDirection(target > index ? 1 : -1)
      setIndex(target)
    },
    [index, total],
  )

  // Load the neighbouring pictures ahead of time so a step never flashes empty.
  useEffect(() => {
    for (const neighbour of [PROCESS_STEPS[index - 1], PROCESS_STEPS[index + 1]]) {
      if (neighbour) new window.Image().src = sharpSrc(neighbour)
    }
  }, [index])

  useEffect(() => {
    if (!zoomed) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomed])

  const onStageKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") goTo(index + 1)
    if (event.key === "ArrowLeft") goTo(index - 1)
  }

  return (
    <section
      aria-labelledby="process-heading"
      className="relative w-full bg-[hsl(var(--brand-midnight))] py-16 text-white md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="process-heading"
            className="text-balance font-serif text-[30px] leading-tight md:text-[42px]"
          >
            The Kalamkari Making Process
          </h2>
          <TempleBellsDivider className="mt-4 text-[hsl(var(--brand-gold))]" />
          <p className="mt-5 text-pretty font-sans text-[15px] leading-relaxed text-[#DCE6F2] md:text-[17px]">
            See how plain cloth becomes a hand-painted Kalamkari piece, one step at a time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 md:mt-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Steps: a swipe row on phones, a timeline beside the picture on desktop */}
          <nav aria-label="Making process steps" className="min-w-0">
            <ol className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:block lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {PROCESS_STEPS.map((item, i) => {
                const active = i === index
                return (
                  <li key={item.id} className="shrink-0 snap-start lg:relative lg:shrink">
                    {i < total - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[5px] top-[26px] hidden h-full w-px bg-[hsl(var(--brand-gold)/0.45)] lg:block"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "flex items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-left font-sans text-[14px] transition-colors lg:relative lg:w-full lg:whitespace-normal lg:rounded-md lg:border-0 lg:bg-transparent lg:px-0 lg:py-3",
                        focusRing,
                        active
                          ? "border-[hsl(var(--brand-gold))] bg-[hsl(var(--brand-gold))] font-semibold text-[hsl(var(--brand-midnight))] lg:text-white"
                          : "border-white/30 text-[#DCE6F2] hover:border-white/60 hover:text-white",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "hidden h-[11px] w-[11px] shrink-0 rounded-full border-2 transition-colors lg:block",
                          active
                            ? "border-[hsl(var(--brand-gold))] bg-[hsl(var(--brand-gold))] shadow-[0_0_0_4px_hsl(var(--brand-gold)/0.25)]"
                            : i < index
                              ? "border-[hsl(var(--brand-gold))] bg-[hsl(var(--brand-gold)/0.55)]"
                              : "border-[hsl(var(--brand-gold)/0.7)] bg-[hsl(var(--brand-midnight))]",
                        )}
                      />
                      <span className="leading-snug">
                        {item.stepNumber === "★" ? "The full journey" : item.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Making process pictures"
            tabIndex={0}
            onKeyDown={onStageKeyDown}
            className={cn("min-w-0 rounded-md", focusRing)}
          >
            {/* Picture: swipe on phones, arrows, or the step list */}
            <div className="rounded-md border border-[hsl(var(--brand-gold)/0.7)] bg-[hsl(var(--brand-midnight-hover))] p-2 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)] sm:p-3">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[3px] bg-black/30 ring-1 ring-[hsl(var(--brand-gold-soft)/0.5)]">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={step.id}
                    custom={direction}
                    variants={reduceMotion ? undefined : stageVariants}
                    initial={reduceMotion ? { opacity: 0 } : "enter"}
                    animate={reduceMotion ? { opacity: 1 } : "center"}
                    exit={reduceMotion ? { opacity: 0 } : "exit"}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -SWIPE_DISTANCE) goTo(index + 1)
                      else if (info.offset.x > SWIPE_DISTANCE) goTo(index - 1)
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={sharpSrc(step)}
                      alt={`${step.title}: ${step.description}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 900px"
                      priority={index === 0}
                      draggable={false}
                      className="select-none object-contain"
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setZoomed(true)}
                  aria-label={`View ${step.title} larger`}
                  className={cn(
                    "absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-[hsl(var(--brand-midnight)/0.85)] text-white transition-colors hover:bg-[hsl(var(--brand-midnight))]",
                    focusRing,
                  )}
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* What is happening in this step */}
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:mt-6">
              <div aria-live="polite" className="min-h-[11rem] min-w-0 sm:min-h-[8.5rem]">
                <h3 className="font-serif text-[22px] leading-tight md:text-[26px]">{step.title}</h3>
                <p className="mt-1 font-sans text-[14px] font-medium text-[hsl(var(--brand-gold-soft))]">
                  {step.subtitle}
                </p>
                <p className="mt-3 max-w-2xl text-pretty font-sans text-[15px] leading-relaxed text-[#DCE6F2]">
                  {step.description}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <StepButton label="Previous step" disabled={index === 0} onClick={() => goTo(index - 1)}>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </StepButton>
                <StepButton label="Next step" disabled={index === total - 1} onClick={() => goTo(index + 1)}>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </StepButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={step.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setZoomed(false)}
          >
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Close larger view"
              className={cn(
                "absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
                focusRing,
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="relative aspect-[3/2] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image
                src={sharpSrc(step)}
                alt={step.title}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
