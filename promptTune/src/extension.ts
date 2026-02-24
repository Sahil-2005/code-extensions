import * as vscode from "vscode";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_CHAR_LIMIT = 30_000;

const SYSTEM_INSTRUCTION = `You are an expert prompt engineer. Rewrite the user's text into a clear, precise, and well-structured AI prompt.

Rules:
- Output ONLY the rewritten prompt, nothing else.
- Keep it short and to the point. Avoid long paragraphs.
- Do NOT use markdown bold (**), headings (#), or decorative formatting.
- Use plain numbered or bulleted lists when structure helps clarity.
- Write so both humans and AI models can understand the intent instantly.
- Never add conversational filler, greetings, or explanations about your changes.`;

/**
 * Reads the Gemini API key from VS Code settings.
 * Returns the key string or undefined if not set.
 */
function getApiKey(): string | undefined {
	const config = vscode.workspace.getConfiguration("prompttune");
	const apiKey = config.get<string>("apiKey");
	if (!apiKey || apiKey.trim().length === 0) {
		return undefined;
	}
	return apiKey.trim();
}

/**
 * Sends text to Gemini for prompt optimization.
 * Returns the optimized text or throws on failure.
 */
async function optimizeWithGemini(apiKey: string, text: string): Promise<string> {
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({
		model: "gemini-2.5-flash",
		systemInstruction: SYSTEM_INSTRUCTION,
	});

	const result = await model.generateContent(text);
	const optimizedText = result.response.text();

	if (!optimizedText || optimizedText.trim().length === 0) {
		throw new Error("EMPTY_RESPONSE");
	}

	return optimizedText;
}

/**
 * Handles errors from the Gemini API and shows appropriate messages.
 */
function handleApiError(error: unknown): void {
	const message = error instanceof Error ? error.message : String(error);

	if (message === "EMPTY_RESPONSE") {
		vscode.window.showWarningMessage(
			"PromptTune: Gemini returned an empty response. Try selecting different text."
		);
	} else if (message.includes("API_KEY_INVALID") || message.includes("401")) {
		vscode.window.showErrorMessage(
			"PromptTune: Invalid API key. Please check your Gemini API key in Settings."
		);
	} else if (
		message.includes("ENOTFOUND") ||
		message.includes("ETIMEDOUT") ||
		message.includes("fetch failed")
	) {
		vscode.window.showErrorMessage(
			"PromptTune: Network error. Please check your internet connection and try again."
		);
	} else {
		vscode.window.showErrorMessage(
			`PromptTune: Failed to optimize text — ${message}`
		);
	}
}

/**
 * Checks if text exceeds the character limit.
 * Returns true if the user wants to proceed (or text is within limit).
 */
async function checkCharacterLimit(text: string): Promise<boolean> {
	if (text.length <= MAX_CHAR_LIMIT) {
		return true;
	}

	const choice = await vscode.window.showWarningMessage(
		`PromptTune: Selected text is ${text.length.toLocaleString()} characters (limit: ${MAX_CHAR_LIMIT.toLocaleString()}). Large inputs may produce unreliable results or fail.`,
		"Proceed Anyway",
		"Cancel"
	);

	return choice === "Proceed Anyway";
}

export function activate(context: vscode.ExtensionContext) {

	// Command 1: Optimize selected text in the active editor
	const optimizeCmd = vscode.commands.registerCommand(
		"prompttune.optimize",
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage(
					"PromptTune: No active editor found."
				);
				return;
			}

			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);

			if (!selectedText || selectedText.trim().length === 0) {
				vscode.window.showWarningMessage(
					"Please highlight the text you want to tune."
				);
				return;
			}

			const apiKey = getApiKey();
			if (!apiKey) {
				vscode.window.showErrorMessage(
					'PromptTune: Gemini API key is not set. Go to Settings → search "PromptTune" → enter your API key.'
				);
				return;
			}

			const shouldProceed = await checkCharacterLimit(selectedText);
			if (!shouldProceed) {
				return;
			}

			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "PromptTune: Optimizing...",
					cancellable: false,
				},
				async () => {
					try {
						const optimizedText = await optimizeWithGemini(apiKey, selectedText);

						await editor.edit((editBuilder) => {
							editBuilder.replace(selection, optimizedText);
						});

						vscode.window.showInformationMessage(
							"PromptTune: Text optimized successfully! ✨"
						);
					} catch (error: unknown) {
						handleApiError(error);
					}
				}
			);
		}
	);

	// Command 2: Optimize text from clipboard (for AI chat panels, etc.)
	const clipboardCmd = vscode.commands.registerCommand(
		"prompttune.optimizeFromClipboard",
		async () => {
			const clipboardText = await vscode.env.clipboard.readText();

			if (!clipboardText || clipboardText.trim().length === 0) {
				vscode.window.showWarningMessage(
					"PromptTune: Clipboard is empty. Copy the text you want to optimize first."
				);
				return;
			}

			const apiKey = getApiKey();
			if (!apiKey) {
				vscode.window.showErrorMessage(
					'PromptTune: Gemini API key is not set. Go to Settings → search "PromptTune" → enter your API key.'
				);
				return;
			}

			const shouldProceed = await checkCharacterLimit(clipboardText);
			if (!shouldProceed) {
				return;
			}

			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "PromptTune: Optimizing clipboard text...",
					cancellable: false,
				},
				async () => {
					try {
						const optimizedText = await optimizeWithGemini(apiKey, clipboardText);

						await vscode.env.clipboard.writeText(optimizedText);

						vscode.window.showInformationMessage(
							"PromptTune: Optimized text copied to clipboard! ✨ Paste it wherever you need."
						);
					} catch (error: unknown) {
						handleApiError(error);
					}
				}
			);
		}
	);

	context.subscriptions.push(optimizeCmd, clipboardCmd);
}

export function deactivate() { }
