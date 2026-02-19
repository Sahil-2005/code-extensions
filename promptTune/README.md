# ⚡ PromptTune

> Highlight messy text. Get a perfectly engineered AI prompt. Instantly.

**PromptTune** is a VS Code extension that lets you select any poorly written text, comment, or rough idea in your editor and instantly rewrite it into a precise, structured AI prompt — powered by **Google Gemini 1.5 Flash**.

---

## ✨ Features

- **One-Command Optimization** — Highlight text → run `PromptTune: Optimize Selected Text` → get a production-quality prompt.
- **In-Editor Replacement** — The optimized prompt replaces your selected text directly, no copy-pasting needed.
- **Progress Notifications** — A native VS Code progress indicator keeps you informed while the API works.
- **Secure API Key Storage** — Your Gemini API key is stored in VS Code's settings, never hardcoded.
- **Graceful Error Handling** — Clear messages for missing API keys, network failures, and empty selections.

---

## 🚀 Getting Started

### 1. Install the Extension

Open VS Code, go to the Extensions panel, and search for **PromptTune** — or install from the `.vsix` file:

```bash
code --install-extension prompttune-0.0.1.vsix
```

### 2. Set Your Gemini API Key

1. Open **Settings** (`Ctrl + ,`)
2. Search for **PromptTune**
3. Paste your [Gemini API Key](https://aistudio.google.com/apikey) into the **Api Key** field

### 3. Use It

1. **Highlight** any text in the editor
2. Open the Command Palette (`Ctrl + Shift + P`)
3. Run **"PromptTune: Optimize Selected Text"**
4. Watch your messy text transform into a well-structured prompt ✨

---

## ⚙️ Extension Settings

| Setting | Type | Description |
|---------|------|-------------|
| `prompttune.apiKey` | `string` | Your Google Gemini API key |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **API:** VS Code Extension API
- **LLM:** Google Gemini 1.5 Flash via `@google/generative-ai` SDK
- **Bundler:** Webpack

---

## 📁 Project Structure

```
promptTune/
├── src/
│   └── extension.ts      # Core extension logic
├── dist/                  # Webpack output (bundled JS)
├── package.json           # Extension manifest & config
├── tsconfig.json          # TypeScript configuration
├── webpack.config.js      # Webpack bundler config
└── README.md
```

---

## 🐛 Known Issues

- Requires an active internet connection to reach the Gemini API.
- Very large text selections may hit API token limits.

---

## 📋 Release Notes

### 0.0.1

- Initial release
- Core command: `prompttune.optimize`
- Gemini 1.5 Flash integration
- Configurable API key via VS Code settings

---

## 📄 License

MIT
