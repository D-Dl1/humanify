import OpenAI from "openai";
import { visitAllIdentifiers } from "../local-llm-rename/visit-all-identifiers.js";
import { showPercentage } from "../../progress.js";
import { verbose } from "../../verbose.js";

export function openaiRename({
  apiKey,
  baseURL,
  model,
  contextWindowSize
}: {
  apiKey: string;
  baseURL: string;
  model: string;
  contextWindowSize: number;
}) {
  const client = new OpenAI({ apiKey, baseURL });

  return async (code: string): Promise<string> => {
    return await visitAllIdentifiers(
      code,
      async (name, surroundingCode) => {
        verbose.log(`Renaming ${name}`);
        verbose.log("Context: ", surroundingCode);

        const response = await client.chat.completions.create(
          toRenamePrompt(name, surroundingCode, model)
        );
        const result = response.choices[0].message?.content;
        if (!result) {
          throw new Error("Failed to rename", { cause: response });
        }
        const renamed = JSON.parse(result).new_name;

        verbose.log(`Renamed to ${renamed}`);

        return renamed;
      },
      contextWindowSize,
      showPercentage
    );
  };
}

function toRenamePrompt(
  name: string,
  surroundingCode: string,
  model: string
): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  return {
    model,
    messages: [
      {
        role: "system",
        content:
          // 关键点：明确要求只输出 json，对返回结构定死键名
          `You rename a JavaScript identifier based on its usage.
Return only json as a single JSON object: {"new_name":"<camelCaseName>","reason":"<short why>"}.
No markdown, no code fences, no extra text.`
      },
      {
        role: "user",
        content:
          `Identifier to rename: ${name}

Code context:
${surroundingCode}

Reply only with json.`
      }
    ],
    // 关键点：保持 json_object
    response_format: { type: "json_object" }
  };
}
