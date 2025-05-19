// File: llmTestStepParser.js
import { z } from "zod";

// -----------------------
// 1. Zod Schemas
// -----------------------
export const LLMTestActionSchema = z.object({
  intent: z.enum([
    "click",
    "doubleClick",
    "rightClick",
    "hover",
    "input",
    "keyboardPress",
    "focus",
    "blur",
    "scrollIntoView",
    "assert",
    "navigate",
    "refresh",
    "verifyTitle",
    "store",
    "useVariable",
    "assertVariable",
    "comparePosition",
    "waitFor",
    "waitForText",
    "delay",
    "switchToTab",
    "switchToFrame",
    "goBack",
    "goForward",
    "closeTab",
    "uploadFile",
    "downloadCheck",
    "clipboardCopy",
    "clipboardPaste",
    "screenshot",
    "highlight",
    "log",
    "visualMatch",
  ]),
  target: z.object({
    type: z.string(),
    name: z.string().nullable(),
    position: z.number().int().positive().nullable(),
    context: z.string().nullable(),
  }),
  value: z.string().nullable(),
  assertionType: z
    .enum([
      "text",
      "value",
      "visible",
      "notVisible",
      "title",
      "url",
      "count",
      "checked",
      "selected",
      "exists",
      "notExists",
      "enabled",
      "disabled",
      "attribute",
      "style",
      "position",
      "elementCount",
      "containsText",
      "ariaLabel",
      "contrastRatio",
      "isVisibleInViewport",
    ])
    .nullable(),
  assertionSubType: z
    .enum([
      "equals",
      "not equals",
      "contains",
      "not contains",
      "starts with",
      "not starts with",
      "ends with",
      "not ends with",
    ])
    .nullable(),
  isSoft: z.boolean().nullable(),
  variableName: z.string().nullable(),
  compareTo: z
    .object({
      target: z.object({
        type: z.string(),
        name: z.string().nullable(),
        position: z.number().int().positive().nullable(),
        context: z.string().nullable(),
      }),
      relation: z.enum(["before", "after", "above", "below"]),
    })
    .nullable(),
});

export const LLMTestActionArraySchema = z.array(LLMTestActionSchema);

// -----------------------
// 2. Validator
// -----------------------
export async function validateLLMResponse(llmOutputText) {
  let parsed;

  try {
    const jsonMatch = llmOutputText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!jsonMatch) throw new Error("Missing valid JSON block");

    const cleaned = jsonMatch[1];
    parsed = JSON.parse(cleaned);

    const result = LLMTestActionArraySchema.safeParse(parsed);
    if (!result.success) {
      return {
        valid: false,
        reason: "Schema validation failed",
        errors: result.error.format(),
      };
    }

    return { valid: true, data: result.data };
  } catch (err) {
    return {
      valid: false,
      reason: err.message,
      raw: llmOutputText,
    };
  }
}

// -----------------------
// 3. Retry Handler
// -----------------------
export async function handleLLMWithRetry(inputText, callLLM) {
  const responseText = await callLLM(inputText);
  const result = await validateLLMResponse(responseText);

  if (result.valid) return result.data;

  const fallbackPrompt = `
Your last response could not be parsed into the expected JSON array of test actions.

Please try again. Remember:
- Enclose output in triple backticks (\`\`\`).
- Return only a valid JSON array.
- Each action must match the schema.

User instruction: "${inputText}"
`.trim();

  const retryResponse = await callLLM(fallbackPrompt);
  const retryResult = await validateLLMResponse(retryResponse);

  if (retryResult.valid) {
    return retryResult.data;
  } else {
    throw new Error(
      `LLM failed after retry: ${retryResult.reason}\nOriginal: ${result.raw}`
    );
  }
}

// -----------------------
// 4. Entry Function
// -----------------------
export async function parseLLMTestSteps(userInput, callLLM) {
  return await handleLLMWithRetry(userInput, callLLM);
}
