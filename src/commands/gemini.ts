import { cli } from "../cli.js";
import prettier from "../plugins/prettier.js";
import { unminify } from "../unminify.js";
import babel from "../plugins/babel/babel.js";
import { verbose } from "../verbose.js";
import { geminiRename } from "../plugins/gemini-rename.js";
import { env } from "../env.js";
import { DEFAULT_CONTEXT_WINDOW_SIZE } from "./default-args.js";
import { parseNumber } from "../number-utils.js";

export const azure = cli()
  .name("gemini")
  .description("Use Google Gemini/AIStudio API to unminify code")
  .option("-m, --model <model>", "The model to use", "gemini-1.5-flash")
  .option("-o, --outputDir <output>", "The output directory", "output")
  .option(
    "--contextSize <contextSize>",
    "The context size to use for the LLM",
    `${DEFAULT_CONTEXT_WINDOW_SIZE}`
  )
  .option(
    "-k, --apiKey <apiKey>",
    "The Google Gemini/AIStudio API key. Alternatively use GEMINI_API_KEY environment variable"
  )
  .option("--verbose", "Show verbose output")
  .option("--resume", "Resume from a previous interrupted session")
  .option("--pause", "Pause processing and save state (can be used with Ctrl+C)")
  .argument("input", "The input minified Javascript file")
  .action(async (filename, opts) => {
    if (opts.verbose) {
      verbose.enabled = true;
    }

    // Check if there's an existing state file when not explicitly resuming
    if (!opts.resume) {
      const { StateManager } = await import("../state-manager.js");
      const stateManager = new StateManager(opts.outputDir);
      const hasState = await stateManager.hasExistingState();
      
      if (hasState) {
        console.log("📋 Found previous session state.");
        console.log("💡 Use --resume to continue from where you left off, or continue to start fresh.");
        console.log("⚠️  Starting fresh will overwrite the previous state.");
        
        // Give user a moment to see the message
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const apiKey = opts.apiKey ?? env("GEMINI_API_KEY");
    const contextWindowSize = parseNumber(opts.contextSize);

    await unminify(filename, opts.outputDir, [
      babel,
      geminiRename({ apiKey, model: opts.model, contextWindowSize }),
      prettier
    ], { resume: opts.resume });
  });
