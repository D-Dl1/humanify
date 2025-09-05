import { cli } from "../cli.js";
import { llama } from "../plugins/local-llm-rename/llama.js";
import { DEFAULT_MODEL } from "../local-models.js";
import { unminify } from "../unminify.js";
import prettier from "../plugins/prettier.js";
import babel from "../plugins/babel/babel.js";
import { localReanme } from "../plugins/local-llm-rename/local-llm-rename.js";
import { verbose } from "../verbose.js";
import { DEFAULT_CONTEXT_WINDOW_SIZE } from "./default-args.js";
import { parseNumber } from "../number-utils.js";

export const local = cli()
  .name("local")
  .description("Use a local LLM to unminify code")
  .showHelpAfterError(true)
  .option("-m, --model <model>", "The model to use", DEFAULT_MODEL)
  .option("-o, --outputDir <output>", "The output directory", "output")
  .option(
    "-s, --seed <seed>",
    "Seed for the model to get reproduceable results (leave out for random seed)"
  )
  .option("--disableGpu", "Disable GPU acceleration")
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

    verbose.log("Starting local inference with options: ", opts);

    const contextWindowSize = parseNumber(opts.contextSize);
    const prompt = await llama({
      model: opts.model,
      disableGpu: opts.disableGpu,
      seed: opts.seed ? parseInt(opts.seed) : undefined
    });
    await unminify(filename, opts.outputDir, [
      babel,
      localReanme(prompt, contextWindowSize),
      prettier
    ], { resume: opts.resume });
  });
