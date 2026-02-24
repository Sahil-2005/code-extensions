# ⚡ PromptTune — AI Prompt Optimizer

> Highlight messy text. Get a perfectly engineered AI prompt. Instantly.

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=sahil-2005.prompttune)

**PromptTune** is a VS Code extension that lets you select any poorly written text, comment, or rough idea in your editor and instantly rewrite it into a precise, structured AI prompt — powered by **Google Gemini**.

📥 **[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sahil-2005.prompttune)**

---

## ✨ Features

- **One-Command Optimization** — Highlight text → run `PromptTune: Optimize Selected Text` → get a production-quality prompt.
- **Clipboard Mode** — Copy text from anywhere (AI chat panels, terminals, browsers) → run `PromptTune: Optimize from Clipboard` → paste the optimized result.
- **In-Editor Replacement** — The optimized prompt replaces your selected text directly, no copy-pasting needed.
- **30K Character Safeguard** — Warns before sending very large selections to the API.
- **Secure API Key Storage** — Your Gemini API key is stored in VS Code settings, never hardcoded.
- **Graceful Error Handling** — Clear messages for missing API keys, network failures, and empty selections.

---

## 🚀 Getting Started

### 1. Install the Extension

**From Marketplace:** Search for **PromptTune** in VS Code Extensions panel, or [install directly](https://marketplace.visualstudio.com/items?itemName=sahil-2005.prompttune).

**From VSIX:**
```bash
code --install-extension prompttune-0.0.1.vsix
```

### 2. Set Your Gemini API Key

1. Open **Settings** (`Ctrl + ,`)
2. Search for **PromptTune**
3. Paste your [Gemini API Key](https://aistudio.google.com/apikey) into the **Api Key** field

### 3. Use It

**Editor mode:**
1. **Highlight** any text in the editor
2. Open the Command Palette (`Ctrl + Shift + P`)
3. Run **"PromptTune: Optimize Selected Text"**
4. Watch your messy text transform into a well-structured prompt ✨

**Clipboard mode (for AI chat panels):**
1. **Copy** text from any source (`Ctrl + C`)
2. Open the Command Palette (`Ctrl + Shift + P`)
3. Run **"PromptTune: Optimize from Clipboard"**
4. **Paste** the optimized result wherever you need (`Ctrl + V`)

---

## ⚙️ Extension Settings

| Setting | Type | Description |
|---------|------|-------------|
| `prompttune.apiKey` | `string` | Your Google Gemini API key |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **API:** VS Code Extension API
- **LLM:** Google Gemini via `@google/generative-ai` SDK
- **Bundler:** Webpack

---

## 📁 Project Structure

```
promptTune/
├── src/
│   ├── extension.ts          # Core extension logic
│   └── test/
│       └── extension.test.ts # Unit tests (sinon mocks)
├── dist/                     # Webpack output (bundled JS)
├── images/
│   └── icon.png              # Extension icon
├── package.json              # Extension manifest & config
├── tsconfig.json             # TypeScript configuration
├── webpack.config.js         # Webpack bundler config
└── README.md
```

---

## 📋 Release Notes

### 0.0.1

- Initial release
- Commands: `prompttune.optimize`, `prompttune.optimizeFromClipboard`
- Gemini integration with concise, clean output
- 30,000 character limit safeguard
- Configurable API key via VS Code settings

---

## 🐛 Known Issues

- Requires an active internet connection to reach the Gemini API.
- Very large text selections may hit API token limits.

---

## 👤 Author

**Sahil Gawade**

[![GitHub](https://img.shields.io/badge/GitHub-Sahil--2005-181717?logo=github)](https://github.com/Sahil-2005)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sahil%20Gawade-0A66C2?logo=linkedin)](https://www.linkedin.com/in/sahil-gawade-920a0a242/)
[![Portfolio](https://img.shields.io/badge/Portfolio-sahil--gawade.vercel.app-000?logo=vercel)](https://sahil-gawade.vercel.app/)
[![Email](https://img.shields.io/badge/Email-gawadesahil.dev@gmail.com-EA4335?logo=gmail)](mailto:gawadesahil.dev@gmail.com)

---

## 📄 License

MIT
