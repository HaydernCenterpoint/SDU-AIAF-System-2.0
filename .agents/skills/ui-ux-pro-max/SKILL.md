---
name: ui-ux-pro-max
description: Design and build professional UI/UX for the Sao Do student assistant across Flutter mobile/web and backend-connected chat flows. Use when building screens, navigation, design systems, chat interfaces, branded student experiences, or reviewing UI quality.
---

# UI UX Pro Max For Sao Do Assistant

Project-specific wrapper around the upstream `nextlevelbuilder/ui-ux-pro-max-skill` repository.

The upstream skill has been cloned locally at:

- `.agents/vendor/ui-ux-pro-max-skill`

Use this local wrapper when designing or implementing UI for this repository.

## Primary Project Target

Build a unified student assistant system based on NemoClaw with:

- Flutter client in `apps/client`
- Shared mobile + web experience from one codebase
- Chat-first workflow similar to ChatGPT
- Backend integration in `packages/backend`
- Sao Do University branding and student-first UX

## Default Design Direction

Always bias toward these decisions unless the task explicitly overrides them:

1. Chat-first product layout
2. Mobile-first interaction model
3. Flutter-first UI implementation
4. Consistent behavior across Android emulator and web
5. Clear visual hierarchy over decorative effects
6. Sao Do brand colors and logo as the primary identity

## Brand Requirements

Use the Sao Do identity already established in the project:

- Primary red: `#E31D1C`
- Secondary blue: `#1784DA`
- Accent gold: `#F7D428`
- Text navy: `#112641`
- Logo asset: `apps/client/assets/images/saodo_logo.svg`

Avoid generic AI purple gradients or unrelated startup branding.

## Product Requirements

The interface should feel like a real student productivity assistant, not a template demo.

Prioritize these flows:

- Ask AI about schedule, classwork, and learning materials
- Browse and continue previous conversations
- See today's classes and reminders quickly
- Access school documents and course materials
- Keep the interface simple enough for daily use by students

## Project-Specific UX Rules

### Must Have

- ChatGPT-like conversation flow with strong readability
- Left conversation rail on wide screens
- Bottom navigation on mobile
- One-tap access to chat, schedule, and documents
- Fast onboarding and no cluttered landing flow
- UI states for loading, empty, and error cases
- Visual consistency between mobile and web

### Avoid

- Marketing-site style layouts for core product screens
- Too many competing cards above the main chat area
- Tiny text, weak contrast, or vague labels
- Hover-only interactions for core tasks
- Overdesigned effects that reduce legibility

## Upstream Skill References

Read these upstream resources when needed:

- Upstream overview: `.agents/vendor/ui-ux-pro-max-skill/README.md`
- Core upstream skill: `.agents/vendor/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max/SKILL.md`
- Design system guidance: `.agents/vendor/ui-ux-pro-max-skill/.claude/skills/design-system/SKILL.md`
- Brand guidance: `.agents/vendor/ui-ux-pro-max-skill/.claude/skills/brand/SKILL.md`

## Optional Search Commands

If Python is available, use the upstream search engine directly for design decisions:

```bash
python .agents/vendor/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "student assistant mobile app" --design-system -p "Sao Do Assistant"
python .agents/vendor/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "chat ui" --domain style
python .agents/vendor/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "flutter" --stack flutter
```

## Working Files In This Repo

- Client app: `apps/client/lib/main.dart`
- Client config: `apps/client/pubspec.yaml`
- Backend API: `packages/backend/src/server.mjs`
- NemoClaw bridge: `packages/backend/src/nemoclaw-client.mjs`
- Runtime prompt: `packages/agent-runtime/config/system-prompt.md`

## How To Apply In This Repo

When asked to build or improve UI here:

1. Start from the chat product model, not a landing page model
2. Preserve a unified app experience across mobile and web
3. Use Sao Do branding consistently
4. Keep components practical and reusable
5. Ensure all UI decisions serve student workflows first

## Related References

- `references/project-context.md`
