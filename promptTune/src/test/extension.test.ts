import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";

// We test by executing the registered commands and verifying the side effects
// via sinon stubs on the vscode API and the @google/generative-ai module.

suite("PromptTune Extension Test Suite", () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	// ── Helper: stub the workspace configuration ──────────────────────
	function stubApiKey(key: string | undefined) {
		const fakeConfig = {
			get: sandbox.stub().returns(key),
			has: sandbox.stub().returns(!!key),
			inspect: sandbox.stub().returns(undefined),
			update: sandbox.stub().resolves(),
		};
		sandbox.stub(vscode.workspace, "getConfiguration").returns(fakeConfig as unknown as vscode.WorkspaceConfiguration);
	}

	// ── Helper: stub the active text editor ───────────────────────────
	function stubEditor(selectedText: string) {
		const selection = new vscode.Selection(0, 0, 0, selectedText.length);
		const fakeEditor = {
			selection,
			document: {
				getText: sandbox.stub().returns(selectedText),
			},
			edit: sandbox.stub().callsFake(async (callback: (eb: { replace: sinon.SinonStub }) => void) => {
				const replaceStub = sandbox.stub();
				callback({ replace: replaceStub });
				return true;
			}),
		};
		sandbox.stub(vscode.window, "activeTextEditor").value(fakeEditor);
		return fakeEditor;
	}

	// ── Helper: stub withProgress to just call the callback ───────────
	function stubProgress() {
		sandbox.stub(vscode.window, "withProgress").callsFake(
			async <T>(_options: vscode.ProgressOptions, task: (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => Thenable<T>) => {
				return task({ report: sandbox.stub() } as vscode.Progress<{ message?: string; increment?: number }>, {} as vscode.CancellationToken);
			}
		);
	}

	// ══════════════════════════════════════════════════════════════════
	// Test: Extension activates and commands are registered
	// ══════════════════════════════════════════════════════════════════
	test("Extension should register prompttune.optimize command", async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(
			commands.includes("prompttune.optimize"),
			"prompttune.optimize command should be registered"
		);
	});

	test("Extension should register prompttune.optimizeFromClipboard command", async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(
			commands.includes("prompttune.optimizeFromClipboard"),
			"prompttune.optimizeFromClipboard command should be registered"
		);
	});

	// ══════════════════════════════════════════════════════════════════
	// Test: Empty selection shows warning
	// ══════════════════════════════════════════════════════════════════
	test("Should warn when no text is selected", async () => {
		stubEditor("");
		const warnStub = sandbox.stub(vscode.window, "showWarningMessage").resolves();

		await vscode.commands.executeCommand("prompttune.optimize");

		assert.ok(
			warnStub.calledOnce,
			"showWarningMessage should be called once"
		);
		assert.ok(
			(warnStub.firstCall.args[0] as string).includes("highlight"),
			"Warning should tell user to highlight text"
		);
	});

	// ══════════════════════════════════════════════════════════════════
	// Test: No active editor shows warning
	// ══════════════════════════════════════════════════════════════════
	test("Should warn when no active editor is found", async () => {
		sandbox.stub(vscode.window, "activeTextEditor").value(undefined);
		const warnStub = sandbox.stub(vscode.window, "showWarningMessage").resolves();

		await vscode.commands.executeCommand("prompttune.optimize");

		assert.ok(
			warnStub.calledOnce,
			"showWarningMessage should be called once"
		);
		assert.ok(
			(warnStub.firstCall.args[0] as string).includes("No active editor"),
			"Warning should mention no active editor"
		);
	});

	// ══════════════════════════════════════════════════════════════════
	// Test: Missing API key shows error
	// ══════════════════════════════════════════════════════════════════
	test("Should show error when API key is not set", async () => {
		stubEditor("some text to optimize");
		stubApiKey("");
		const errorStub = sandbox.stub(vscode.window, "showErrorMessage").resolves();

		await vscode.commands.executeCommand("prompttune.optimize");

		assert.ok(
			errorStub.calledOnce,
			"showErrorMessage should be called once"
		);
		assert.ok(
			(errorStub.firstCall.args[0] as string).includes("API key is not set"),
			"Error should mention missing API key"
		);
	});

	test("Should show error when API key is undefined", async () => {
		stubEditor("some text to optimize");
		stubApiKey(undefined);
		const errorStub = sandbox.stub(vscode.window, "showErrorMessage").resolves();

		await vscode.commands.executeCommand("prompttune.optimize");

		assert.ok(
			errorStub.calledOnce,
			"showErrorMessage should be called exactly once"
		);
		assert.ok(
			(errorStub.firstCall.args[0] as string).includes("API key is not set"),
			"Error should mention missing API key"
		);
	});

	// ══════════════════════════════════════════════════════════════════
	// Test: Character limit warning (30,000 chars)
	// ══════════════════════════════════════════════════════════════════
	test("Should warn when selected text exceeds 30,000 characters", async () => {
		const longText = "a".repeat(35_000);
		stubEditor(longText);
		stubApiKey("test-api-key-fake");

		// User clicks "Cancel"
		const warnStub = sandbox.stub(vscode.window, "showWarningMessage").resolves("Cancel" as unknown as vscode.MessageItem);

		await vscode.commands.executeCommand("prompttune.optimize");

		assert.ok(
			warnStub.calledOnce,
			"showWarningMessage should be called for character limit"
		);
		assert.ok(
			(warnStub.firstCall.args[0] as string).includes("35,000"),
			"Warning should show the actual character count"
		);
	});

	// ══════════════════════════════════════════════════════════════════
	// Test: Clipboard command — empty clipboard
	// ══════════════════════════════════════════════════════════════════
	test("Clipboard command should warn when clipboard is empty", async () => {
		sandbox.stub(vscode.env.clipboard, "readText").resolves("");
		const warnStub = sandbox.stub(vscode.window, "showWarningMessage").resolves();

		await vscode.commands.executeCommand("prompttune.optimizeFromClipboard");

		assert.ok(
			warnStub.calledOnce,
			"showWarningMessage should be called once for empty clipboard"
		);
		assert.ok(
			(warnStub.firstCall.args[0] as string).includes("Clipboard is empty"),
			"Warning should mention empty clipboard"
		);
	});

	// ══════════════════════════════════════════════════════════════════
	// Test: Clipboard command — missing API key
	// ══════════════════════════════════════════════════════════════════
	test("Clipboard command should error when API key is missing", async () => {
		sandbox.stub(vscode.env.clipboard, "readText").resolves("some clipboard text");
		stubApiKey("");
		const errorStub = sandbox.stub(vscode.window, "showErrorMessage").resolves();

		await vscode.commands.executeCommand("prompttune.optimizeFromClipboard");

		assert.ok(
			errorStub.calledOnce,
			"showErrorMessage should be called once"
		);
		assert.ok(
			(errorStub.firstCall.args[0] as string).includes("API key is not set"),
			"Error should mention missing API key"
		);
	});
});
