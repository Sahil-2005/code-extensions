import * as vscode from "vscode";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are an expert prompt engineer. Rewrite the following text to be a precise, detailed, and highly structured prompt. Output ONLY the rewritten prompt, no conversational filler, no markdown formatting blocks unless part of the prompt.`;

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"prompttune.optimize",
		async () => {
			// 1. Get the active editor & selected text
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

			// 2. Read the API key from settings
			const config = vscode.workspace.getConfiguration("prompttune");
			const apiKey = config.get<string>("apiKey");

			if (!apiKey || apiKey.trim().length === 0) {
				vscode.window.showErrorMessage(
					'PromptTune: Gemini API key is not set. Go to Settings → search "PromptTune" → enter your API key.'
				);
				return;
			}

			// 3. Call Gemini with progress notification
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "PromptTune: Optimizing...",
					cancellable: false,
				},
				async () => {
					try {
						const genAI = new GoogleGenerativeAI(apiKey);
						const model = genAI.getGenerativeModel({
							model: "gemini-2.5-flash",
							systemInstruction: SYSTEM_INSTRUCTION,
						});

						const result = await model.generateContent(selectedText);
						const optimizedText = result.response.text();

						if (!optimizedText || optimizedText.trim().length === 0) {
							vscode.window.showWarningMessage(
								"PromptTune: Gemini returned an empty response. Try selecting different text."
							);
							return;
						}

						// 4. Replace the selected text with the optimized prompt
						await editor.edit((editBuilder) => {
							editBuilder.replace(selection, optimizedText);
						});

						vscode.window.showInformationMessage(
							"PromptTune: Text optimized successfully! ✨"
						);
					} catch (error: unknown) {
						const message =
							error instanceof Error ? error.message : String(error);

						if (message.includes("API_KEY_INVALID") || message.includes("401")) {
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
				}
			);
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() { }
