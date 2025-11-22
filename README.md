# MindFlow

> **Capture thoughts, find clarity.** An AI-powered second brain that structures your mess.

MindFlow is a modern note-taking application designed to help you organize chaotic thoughts into structured, actionable insights. Powered by AI, it transforms raw, unstructured text into clean, organized notes while providing intelligent search and retrieval capabilities.

---

## ✨ Features

### 📝 Smart Note Organization
- **AI-Powered Formatting**: Automatically structures messy notes into clean Markdown with proper hierarchy
- **Multiple Note Types**: Support for raw notes, formatted notes, and AI-generated summaries
- **Auto-Tagging**: Intelligent hashtag generation for easy categorization and discovery
- **Pin & Archive**: Keep important notes at the top or archive them for later reference

### 🤖 AI-Powered Assistant
- **Second Brain Chat**: Ask questions about your notes using RAG (Retrieval-Augmented Generation)
- **Intelligent Context**: The AI understands your notes and provides accurate, contextual answers
- **Natural Language**: Query your notes conversationally without worrying about exact keywords

### 🎨 Beautiful User Experience
- **Dark & Light Themes**: Choose between Mocha (dark) and Latte (light) themes
- **Smooth Animations**: Framer Motion-powered transitions for a polished feel
- **Mobile-First Design**: Optimized for mobile devices with gesture support
- **Responsive Layout**: Works seamlessly on all screen sizes

### 💾 Local Storage
- **Privacy-First**: All notes are stored locally in your browser—no cloud sync required
- **Persistent Data**: Your notes survive browser refreshes and sessions
- **Easy Export**: Clear all data whenever you want with one click

### 🌍 Multilingual Support
- **Language Preservation**: The AI respects your note's original language
- **No Forced Translation**: Content stays in Spanish, English, or any language you use

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindflow.git
   cd mindflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_ENDPOINT=https://enter.pollinations.ai/api/generate/v1/chat/completions
   VITE_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   Navigate to `http://localhost:3000` (or the URL shown in your terminal)

---

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

### Preview Build
```bash
npm run preview
```

---

## 🏗️ Project Structure

```
mindflow/
├── components/           # React components
│   ├── ChatInterface.tsx     # AI chat interface
│   ├── NoteCard.tsx          # Individual note display
│   ├── NoteInput.tsx         # Note creation/editing
│   ├── Settings.tsx          # Settings panel
│   └── ConfirmationModal.tsx # Confirmation dialogs
├── services/            # Business logic
│   ├── ai.ts               # AI service & API calls
│   └── storage.ts          # Local storage management
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
└── vite.config.ts       # Vite configuration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Build Tool** | Vite 6 |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **UI Icons** | Lucide React |
| **Markdown** | React Markdown + Remark GFM |
| **AI API** | Pollinations (Gemini) |

---

## 🎯 How to Use

### Creating a Note
1. Tap the **+** button in the Notes tab
2. Write your thoughts (messy or organized)
3. Choose a format:
   - **Raw**: Keep your text as-is
   - **Formatted**: Let AI structure it into Markdown
   - **Summary**: Generate a concise summary

### Using AI Magic
- The app automatically generates relevant tags
- Revert to original text if needed with the undo button
- Edit formatted notes anytime

### Searching Your Notes
1. Go to the **Ask AI** tab
2. Type your question naturally
3. The AI searches your notes and provides contextual answers

### Managing Notes
- **Swipe Right**: Pin a note to keep it at the top
- **Swipe Left**: Delete a note
- **Archive**: Hide notes without deleting them
- **Edit**: Tap a note to modify its content

### Settings
- Toggle between Dark and Light themes
- Clear all notes and start fresh
- View app information

---

## 🔧 Configuration

### API Configuration
MindFlow uses the Pollinations API for AI features. To set it up:

1. Get an API key from [Pollinations](https://enter.pollinations.ai)
2. Add it to your `.env` file as `VITE_API_KEY`
3. Optionally customize the API endpoint with `VITE_API_ENDPOINT`

### Customization
- **Theme Colors**: Modify Tailwind CSS variables in your CSS files
- **AI Behavior**: Adjust temperature and prompts in `services/ai.ts`
- **Storage**: Configure localStorage limits in `services/storage.ts`

---

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙋 Support & Feedback

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/mindflow/issues)
- **Discussions**: Share ideas and feedback in [GitHub Discussions](https://github.com/yourusername/mindflow/discussions)
- **Email**: [your-email@example.com]

---

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev) and [Vite](https://vitejs.dev)
- AI powered by [Pollinations](https://pollinations.ai)
- Icons from [Lucide React](https://lucide.dev)
- Animations with [Framer Motion](https://www.framer.com/motion/)

---

**Made with ❤️ to help you organize your thoughts**
