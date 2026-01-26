# 🎙️ Podcast Blog

A personal podcast summarizer and organizer built with React, TypeScript, and Tailwind CSS.

## 📋 Project Overview

Track, summarize, and organize podcasts you listen to. Get AI-generated summaries and tag them for easy search and filtering.

## ✨ Features

- **Podcast Summaries**: Structured, detailed summaries of podcast episodes
- **Smart Tagging**: User-created tags with frequency-based filtering
- **Search & Filter**: Find podcasts by title, creator, guest, or tags
- **Date Sorting**: Organized by most recently added
- **Rating System**: Rate episodes 1-5 stars
- **Multi-Device Sync** (Phase 4): Access from laptop and phone

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Backend** (Phase 4): Supabase (Postgres)
- **Build Tool**: Vite
- **Transcription**: Deepgram API

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── Layout/       # Header, Sidebar
│   ├── Podcast/      # PodcastCard, PodcastList
│   └── Filters/      # SearchBar, TagFilter
├── context/          # React Context (state management)
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces
├── utils/            # Helper functions & sample data
└── styles/           # Global styles & Tailwind config
```
