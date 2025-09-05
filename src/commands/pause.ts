import { cli } from "../cli.js";
import { StateManager } from "../state-manager.js";
import fs from "fs/promises";
import path from "path";

export const pause = cli()
  .name("pause")
  .description("Manually pause a running humanify process")
  .option("-o, --outputDir <output>", "The output directory where state is stored", "output")
  .action(async (opts) => {
    const stateManager = new StateManager(opts.outputDir);
    
    try {
      const hasState = await stateManager.hasExistingState();
      
      if (!hasState) {
        console.log("⚠️  No running process found to pause.");
        console.log("💡 Make sure the output directory is correct and a process is currently running.");
        return;
      }
      
      const state = await stateManager.loadState();
      if (state && !state.isPaused) {
        state.isPaused = true;
        await stateManager.saveState(state);
        console.log("⏸️  Process has been marked for pausing.");
        console.log("📁 State saved in:", path.resolve(opts.outputDir));
        console.log("🔄 The running process will pause at the next checkpoint.");
      } else {
        console.log("ℹ️  Process is already paused or no active session found.");
      }
      
    } catch (error) {
      console.error("❌ Failed to pause process:", error);
    }
  });

export const status = cli()
  .name("status")
  .description("Check the status of a humanify process")
  .option("-o, --outputDir <output>", "The output directory where state is stored", "output")
  .action(async (opts) => {
    const stateManager = new StateManager(opts.outputDir);
    
    try {
      const hasState = await stateManager.hasExistingState();
      
      if (!hasState) {
        console.log("📊 No saved state found.");
        console.log("💡 Either no process has been run, or the last process completed successfully.");
        return;
      }
      
      const state = await stateManager.loadState();
      if (state) {
        console.log("📊 Process Status:");
        console.log(`📁 Input file: ${state.filename}`);
        console.log(`📂 Output directory: ${state.outputDir}`);
        console.log(`📈 Progress: ${state.currentFileIndex}/${state.totalFiles} files processed`);
        console.log(`⏰ Last updated: ${new Date(state.timestamp).toLocaleString()}`);
        console.log(`${state.isPaused ? '⏸️  Status: PAUSED' : '▶️  Status: RUNNING'}`);
        
        if (state.processedFiles.size > 0) {
          console.log(`✅ Completed files: ${state.processedFiles.size}`);
        }
        
        const percentage = Math.round((state.currentFileIndex / state.totalFiles) * 100);
        console.log(`📊 Overall progress: ${percentage}%`);
        
        if (state.isPaused) {
          console.log("💡 Use --resume flag to continue processing.");
        }
      }
      
    } catch (error) {
      console.error("❌ Failed to check status:", error);
    }
  });