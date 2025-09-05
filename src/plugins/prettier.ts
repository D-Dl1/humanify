import prettier from "prettier";

export default async (code: string, stateManager?: any): Promise<string> =>
  prettier.format(code, { parser: "babel" });
