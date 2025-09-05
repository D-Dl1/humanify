import fs from "fs/promises";
import path from "path";
import { verbose } from "./verbose.js";

export interface ProcessingState {
  filename: string;
  outputDir: string;
  currentFileIndex: number;
  totalFiles: number;
  extractedFiles: Array<{ path: string; [key: string]: any }>;
  processedFiles: Set<string>;
  renames: Record<string, string>;
  visitedIdentifiers: Set<string>;
  isPaused: boolean;
  timestamp: number;
}

export class StateManager {
  private stateFilePath: string;
  private currentState: ProcessingState | null = null;
  private isPaused = false;

  constructor(outputDir: string) {
    this.stateFilePath = path.join(outputDir, ".humanify-state.json");
  }

  async saveState(state: ProcessingState): Promise<void> {
    try {
      state.timestamp = Date.now();
      state.processedFiles = new Set([...state.processedFiles]); // Convert to array for JSON
      state.visitedIdentifiers = new Set([...state.visitedIdentifiers]);
      
      const stateData = {
        ...state,
        processedFiles: [...state.processedFiles],
        visitedIdentifiers: [...state.visitedIdentifiers]
      };
      
      await fs.writeFile(this.stateFilePath, JSON.stringify(stateData, null, 2));
      this.currentState = state;
      verbose.log(`State saved to ${this.stateFilePath}`);
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }

  async loadState(): Promise<ProcessingState | null> {
    try {
      const data = await fs.readFile(this.stateFilePath, "utf-8");
      const stateData = JSON.parse(data);
      
      // Convert arrays back to Sets
      stateData.processedFiles = new Set(stateData.processedFiles || []);
      stateData.visitedIdentifiers = new Set(stateData.visitedIdentifiers || []);
      
      this.currentState = stateData;
      verbose.log(`State loaded from ${this.stateFilePath}`);
      return stateData;
    } catch (error) {
      if ((error as any).code !== "ENOENT") {
        console.error("Failed to load state:", error);
      }
      return null;
    }
  }

  async clearState(): Promise<void> {
    try {
      await fs.unlink(this.stateFilePath);
      this.currentState = null;
      verbose.log("State cleared");
    } catch (error) {
      if ((error as any).code !== "ENOENT") {
        console.error("Failed to clear state:", error);
      }
    }
  }

  pause(): void {
    this.isPaused = true;
    if (this.currentState) {
      this.currentState.isPaused = true;
    }
    console.log("\n🔄 Processing paused. State has been saved.");
    console.log("To resume, run the same command with --resume flag");
  }

  resume(): void {
    this.isPaused = false;
    if (this.currentState) {
      this.currentState.isPaused = false;
    }
    console.log("▶️  Resuming processing...");
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  getCurrentState(): ProcessingState | null {
    return this.currentState;
  }

  async hasExistingState(): Promise<boolean> {
    try {
      await fs.access(this.stateFilePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Global pause flag for signal handling
let globalPauseRequested = false;

export function requestPause(): void {
  globalPauseRequested = true;
}

export function isPauseRequested(): boolean {
  return globalPauseRequested;
}

export function clearPauseRequest(): void {
  globalPauseRequested = false;
}

// Signal handlers for graceful shutdown
export function setupSignalHandlers(stateManager: StateManager): void {
  const handleSignal = async (signal: string) => {
    console.log(`\n📡 Received ${signal}, saving state and pausing...`);
    requestPause();
    
    // Actually save the current state before exiting
    try {
      const currentState = stateManager.getCurrentState();
      if (currentState) {
        await stateManager.saveState(currentState);
        console.log("✅ State saved successfully.");
      }
    } catch (error) {
      console.error("❌ Failed to save state:", error);
    }
    
    // Give some time for graceful shutdown
    setTimeout(() => {
      console.log("⏸️  Process paused. Run with --resume to continue.");
      process.exit(0);
    }, 1000);
  };

  process.on("SIGINT", () => {
    handleSignal("SIGINT (Ctrl+C)").catch(console.error);
  });
  process.on("SIGTERM", () => {
    handleSignal("SIGTERM").catch(console.error);
  });
  
  // Handle uncaught exceptions and network errors
  process.on("uncaughtException", (error) => {
    console.log("\n❌ Uncaught exception:", error.message);
    if (error.message.includes("ENOTFOUND") || error.message.includes("ECONNREFUSED")) {
      console.log("🌐 Network error detected, saving state...");
      requestPause();
    }
  });

  process.on("unhandledRejection", (reason: any) => {
    console.log("\n❌ Unhandled rejection:", reason?.message || reason);
    if (reason?.message?.includes("ENOTFOUND") || reason?.message?.includes("ECONNREFUSED")) {
      console.log("🌐 Network error detected, saving state...");
      requestPause();
    }
  });
}