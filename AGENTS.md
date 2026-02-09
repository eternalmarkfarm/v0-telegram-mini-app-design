# Working Principles for This Project

These rules are intended to keep changes professional, systematic, and product‑grade.

## Assistant quality rules (global)
- **Schema‑first:** validate configs/manifests/migrations against official schema or docs before coding.
- **Convention‑first:** follow official or project file/entry naming conventions unless explicitly agreed.
- **Assume‑nothing:** when multiple valid options exist, ask or mirror the user’s baseline example.
- **Single source of truth:** prefer user‑provided working templates over generic defaults.
- **Critical path check:** verify entrypoints, required keys, and startup flows before handoff.
- **Minimal change set:** keep fixes and new features separated; land a working baseline first.
- **Explicit feedback loop:** confirm observed runtime output/errors before further changes.

## Before making changes
- Provide a short **strategy** (1–2 paragraphs) with 2–3 possible approaches.
- Call out **risks and tradeoffs**.
- Propose a **mini‑plan**: what will change, why, and how we will verify success.

## Implementation style
- Prefer **systemic solutions** over patching symptoms.
- Avoid one‑off CSS tweaks unless they are part of a broader design rule.
- If multiple fixes exist, pick the most **robust and future‑proof** one.

## Quality bar
- Focus on **product quality** over speed.
- Define or confirm **acceptance criteria** (visual/UX/behavioral).
- Ensure changes do not degrade other platforms or existing flows.

## Communication
- Explain why a change is best, not just what was changed.
- If a decision is uncertain, ask to choose between options.

## UI/UX decision checklist
- Define the **target baseline** (device, Telegram WebView, scale).
- Validate against **3 contexts**: Telegram Desktop (Linux), Telegram Mobile (iOS/Android), and browser.
- Prefer **layout systems** (container queries, fluid grids, clamps) over fixed pixel tweaks.
- Always check for **text overflow** and **icon alignment** at common widths.
- If visuals are disputed, request a **reference screenshot** from the “correct” environment.

## Acceptance criteria template
Use this when starting any UI change:
- **Goal:** кратко, что должно выглядеть/работать иначе.
- **Must‑match:** 1–2 референс‑скрина или точные правила (иконки, отступы, цвета).
- **Behavior:** как обновляются данные (интервалы, кэш, мгновенность).
- **Cross‑platform:** Linux TG / Mobile TG / Browser — что должно быть одинаковым.
- **No‑regression:** какие экраны/блоки нельзя сломать.
- **Done‑check:** шаги проверки (что открыть, где смотреть, какие данные ждать).
