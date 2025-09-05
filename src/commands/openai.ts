import { cli } from "../cli.js";
import prettier from "../plugins/prettier.js";
import { unminify } from "../unminify.js";
import babel from "../plugins/babel/babel.js";
import { openaiRename } from "../plugins/openai/openai-rename.js";
import { verbose } from "../verbose.js";
import { env } from "../env.js";
import { parseNumber } from "../number-utils.js";
import { DEFAULT_CONTEXT_WINDOW_SIZE } from "./default-args.js";

export const openai = cli()
  .name("openai")
  .description("Use OpenAI's API to unminify code")
  .option("-m, --model <model>", "The model to use", "gpt-4o-mini")
  .option("-o, --outputDir <output>", "The output directory", "output")
  .option(
    "-k, --apiKey <apiKey>",
    "The OpenAI API key. Alternatively use OPENAI_API_KEY environment variable"
  )
  .option(
    "--baseURL <baseURL>",
    "The OpenAI base server URL.",
    env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1"
  )
  .option("--verbose", "Show verbose output")
  .option(
    "--contextSize <contextSize>",
    "The context size to use for the LLM",
    `${DEFAULT_CONTEXT_WINDOW_SIZE}`
  )
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

    const apiKey = opts.apiKey ?? env("OPENAI_API_KEY");
    const baseURL = opts.baseURL;
    const contextWindowSize = parseNumber(opts.contextSize);
    
    await unminify(filename, opts.outputDir, [
      babel,
      openaiRename({
        apiKey,
        baseURL,
        model: opts.model,
        contextWindowSize
      }),
      prettier
    ], { resume: opts.resume });
  });
