import fs from "fs/promises";
import { ensureFileExists } from "./file-utils.js";
import { webcrack } from "./plugins/webcrack.js";
import { verbose } from "./verbose.js";
import { StateManager, ProcessingState, isPauseRequested, setupSignalHandlers } from "./state-manager.js";

export async function unminify(
  filename: string,
  outputDir: string,
  plugins: ((code: string, stateManager?: StateManager) => Promise<string>)[] = [],
  options: { resume?: boolean } = {}
) {
  ensureFileExists(filename);
  
  const stateManager = new StateManager(outputDir);
  setupSignalHandlers(stateManager);

  let state: ProcessingState;
  let extractedFiles: any[];
  let startIndex = 0;

  // Check if we should resume from previous state
  if (options.resume) {
    const existingState = await stateManager.loadState();
    if (existingState) {
      console.log(`📂 Resuming from previous session...`);
      console.log(`📊 Progress: ${existingState.currentFileIndex}/${existingState.totalFiles} files processed`);
      
      state = existingState;
      extractedFiles = existingState.extractedFiles;
      startIndex = existingState.currentFileIndex;
      stateManager.resume();
    } else {
      console.log("⚠️  No previous state found, starting fresh...");
      options.resume = false;
    }
  }

  // If not resuming or no existing state, start fresh
  if (!options.resume) {
    const bundledCode = await fs.readFile(filename, "utf-8");
    extractedFiles = await webcrack(bundledCode, outputDir);
    
    state = {
      filename,
      outputDir,
      currentFileIndex: 0,
      totalFiles: extractedFiles.length,
      extractedFiles,
      processedFiles: new Set(),
      renames: {},
      visitedIdentifiers: new Set(),
      isPaused: false,
      timestamp: Date.now()
    };

    // Clear any existing state
    await stateManager.clearState();
  }

  console.log(`🚀 Processing ${extractedFiles.length} files...`);

  for (let i = startIndex; i < extractedFiles.length; i++) {
    // Check for pause request
    if (isPauseRequested() || stateManager.isPausedState()) {
      state.currentFileIndex = i;
      await stateManager.saveState(state);
      stateManager.pause();
      return;
    }

    console.log(`Processing file ${i + 1}/${extractedFiles.length}: ${extractedFiles[i].path}`);

    const file = extractedFiles[i];
    
    // Skip if already processed
    if (state.processedFiles.has(file.path)) {
      verbose.log(`Skipping already processed file ${file.path}`);
      continue;
    }

    const code = await fs.readFile(file.path, "utf-8");

    if (code.trim().length === 0) {
      verbose.log(`Skipping empty file ${file.path}`);
      state.processedFiles.add(file.path);
      state.currentFileIndex = i + 1;
      await stateManager.saveState(state);
      continue;
    }

    try {
      const formattedCode = await plugins.reduce(
        (p, next) => p.then((code) => next(code, stateManager)),
        Promise.resolve(code)
      );

      verbose.log("Input: ", code);
      verbose.log("Output: ", formattedCode);

      await fs.writeFile(file.path, formattedCode);
      state.processedFiles.add(file.path);
      state.currentFileIndex = i + 1;
      
      // Save state periodically
      await stateManager.saveState(state);

    } catch (error) {
      console.error(`❌ Error processing file ${file.path}:`, error);
      
      // Check if it's a network error
      if (error instanceof Error && (
        error.message.includes("ENOTFOUND") || 
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch failed")
      )) {
        console.log("🌐 Network error detected, saving state for retry...");
        state.currentFileIndex = i;
        await stateManager.saveState(state);
        stateManager.pause();
        return;
      }
      
      // For other errors, continue with next file
      state.processedFiles.add(file.path);
      state.currentFileIndex = i + 1;
      await stateManager.saveState(state);
    }
  }

  // Clear state on successful completion
  await stateManager.clearState();
  console.log(`✅ Done! You can find your unminified code in ${outputDir}`);
}
