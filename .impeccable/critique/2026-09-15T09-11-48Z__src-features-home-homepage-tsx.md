---
target: home page
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
timestamp: 2026-09-15T09-11-48Z
slug: src-features-home-homepage-tsx
---
Method: dual-agent (A: design-review agent · B: detector and browser agent)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Hero and announcement bar auto-rotate with no position/pause; failed product fetch leaves heading over empty grid |
| 2 | Match System / Real World | 3 | Good category language; "Duppatta", "Duppatas", "Chandar I" read as errors; "View Full Gallery" opens the shop |
| 3 | User Control and Freedom | 2 | Hero 4.5s and announcement 4s rotation without pause; cart icon login-guarded |
| 4 | Consistency and Standards | 1 | Hover colour varies (gold/royal/royal fill); three button styles; gallery heading still brown |
| 5 | Error Prevention | 3 | "No obligation" commission copy; low-risk page |
| 6 | Recognition Rather Than Recall | 3 | Category photos + live counts; fake-link tags in Soul section |
| 7 | Flexibility and Efficiency | n/a | Persuade surface, no expert workflow |
| 8 | Aesthetic and Minimalist Design | 1 | Hero has 11 competing elements; middle sections decorative filler |
| 9 | Error Recovery | 2 | Silent empty states on data failure |
| 10 | Help and Documentation | n/a | Help lives in FAQ + WhatsApp |
| Total | | 17/32 | Acceptable (53%) |

## Design Specificity Verdict
Mostly interchangeable. Authored: temple-arch fabric tiles, crest-diamond rule, midnight footer with crest watermark. Template: eyebrow + hairlines + serif heading with a blue word repeated six times; Lucide icon rows; three icon cards; particles and looping lines. Detector: CLI clean (0). Browser overlay 39 anti-patterns: 16 undersized 10px text, 10 thin-border/wide-shadow, kicker above "Masterpieces", dark glow in legacy #C19A5B on SHOP COLLECTION, Inter 78%; image-hover-transform (27) and clipped-overflow (9) mostly intentional. Colour census: royal on 61 elements (43 icon strokes, 14 kickers/heading words, filled buttons), gold on 106. Hover: header icons -> gold 1.58:1; SHOP COLLECTION hover white-on-gold 1.86:1.

## Priority Issues
- [P0] Mobile Saree fabrics left column never reveals (clip-path whileInView stuck at inset(100%)). Fix: remove per-item clip reveal in CategoryShowcase.tsx. /impeccable harden
- [P1] Gold hover/focus unreadable on light (1.58, 1.86, 1.82; focus ring 1.74); WhatsApp icon royal-on-royal invisible. Fix: hover = deeper same colour + 2px gold line; focus royal on light, gold-soft on midnight. /impeccable colorize
- [P1] Royal blue default everywhere (icons, kickers, heading words, buttons). Fix: role system — midnight #0B2A55 primary buttons, royal #0A63B8 links/selected ~3%, ink icons, no coloured heading words, gold ornament only. /impeccable colorize
- [P1] Middle sections template filler (Process icons, Promise cards, "Woven in Elegance" on painted art with navy gradient, Soul reuses hero photo + typo). Fix: Process midnight photo band; Promise -> fact strip (GI App No. 28, Made in Srikalahasti, natural dyes, sold by makers); gallery -> Wall paintings linking to category; custom studio as closing band. /impeccable shape
- [P2] Hero overloaded and repetitive (crest + duplicate 88px wordmark, 5-image rotation, 55% 10px badges, admin gear public). Fix: crest + offer line, one primary + text link, two real facts, pause or single image, admin-only gear. /impeccable distill

## Colour role system
Canvas #F7FAFD; surface #FFFFFF; sky band #E6F0FA; ink #0E2240 (15.2); ink-soft #33455E (9.3); muted #54657C (5.7); primary #0B2A55 fill with #F7FAFD text (13.6), hover #123A70 + 2px gold underline; secondary white + 1px ink border (15.9), hover #FBF1D0 wash; royal #0A63B8 links/selected/focus (5.7); gold #F2B705 ornament only; midnight band #0B2A55 with #DCE6F2 body (11.3) and #FCE38A gold (11.2); WhatsApp #1F7A4D (5.3); madder #A8321E status only (6.4).

## Persona Red Flags
Jordan: no pen-Kalamkari explanation above fold; commission ask before products; first featured piece ₹65,999 with discount chip; "Chandar I"/"Duppatta". Casey: blank fabric column; 11,500px page; three floating widgets cover content; truncated titles; strip cut at "Customisat…"; footer targets 22-26px. Riley: failed fetch leaves orphan heading/button; particles and gallery lines ignore reduced motion; gallery tiles not links; dead galleryScrollRef effect.

## Minor Observations
Next/Image quality=80 not in allowed qualities (8 warnings); legacy tan/brown SVG patterns in Promise and gallery; footer separators 2.57:1; "Refund Policy" link vs all-sales-final; Instagram handle "offical"; unused state/imports; header crest blurs at 40-48px.

## Questions to Consider
- Would midnight bands (top and middle) feel more like the gold-on-black crest than any button colour?
- Without real photos of kalam, dye or washing, is an icon Process section better than none?
- Do discount chips on final-sale heritage pieces build trust or cheapen them?
