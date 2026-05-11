# Sao Do Assistant Project Context

## Goal

Create one integrated AI assistant system for students based on NemoClaw.

## Core Architecture

- `apps/client`: Flutter client for Android + web
- `packages/backend`: shared backend API
- `packages/agent-runtime`: NemoClaw runtime configuration

## UX Model

The product should behave more like ChatGPT than a university portal homepage.

### Primary screen priority

1. Conversation list
2. Active chat thread
3. Quick schedule access
4. Document access

## Key Student Jobs To Support

- Check today's classes
- Ask where and when a class happens
- Find course materials quickly
- Summarize lessons and documents
- Continue previous conversations
- Stay on top of reminders and academic tasks

## Visual Intent

- Modern but trustworthy
- Academic, not corporate SaaS
- High contrast and clean structure
- Strong red/blue brand cues from Sao Do logo
- Gold as accent only, not dominant background color

## Implementation Bias

- Prefer solid structure over flashy effects
- Prefer excellent spacing and typography over excessive decoration
- Prefer reusable app-shell patterns
- Prefer mobile ergonomics first, then adapt to desktop/web
