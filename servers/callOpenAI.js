import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calls the LLM with a structured system prompt + user instruction.
 * Returns the raw assistant message as plain text.
 */
export async function callLLM(userInput) {
  const systemPrompt =
    `You are an intelligent UI test automation assistant. Convert the user's instructions into an array of test steps, formatted as JSON.
    Your aim is to take the ouput json and map it to actionable steps using playwright or selenium or any UI test automation tool.
Rules:
- Return only a JSON array wrapped in triple backticks (\`\`\`).
- Do not include any explanation.
- Each item in the array represents one test step.

Each step must follow this schema:
{
  "intent": string,           // e.g., "click", "input", "assert", "hover", etc.
  "target": {
    "type": string,           // e.g., "button", "input", "dropdown", "tab", etc.Do not assume and instead leave blank if not provided by user 
    "name": string | null,    // Text label, aria-label, or null if unknown. Do not mix it up with value which comes later
    "position": number | null,// Fallback index (e.g., 3rd button)
    "context": string | null  // Optional scope like "login form"
  },
  "value": string | null,         // For inputs or assertions
  "assertionType": string | null, // For assertions only. (enum values are: "text",
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
      "isVisibleInViewport")
  "assertionSubType": string | null, // For parent  assertions whether the assert type is equals,not equals, contains, not contains, starts with , ends with, not starts with , not ends with 
  "isSoft": boolean | null,       // Whether assertion should be soft
  "variableName": string | null,  // For storing values (e.g., page title into variable)
  "compareTo": {                  // For relative position assertions
    "target": { "type": string, "name": string | null, "position": number | null, "context": string | null },
    "relation": "before" | "after" | "above" | "below"
  } | null
}

Supported intents:
- click, doubleClick, rightClick, hover, input, keyboardPress, focus, blur, scrollIntoView
- assert, navigate, refresh, verifyTitle
- store, useVariable, assertVariable
- comparePosition
- waitFor, waitForText, delay
- switchToTab, switchToFrame, goBack, goForward, closeTab
- uploadFile, downloadCheck, clipboardCopy, clipboardPaste
- screenshot, highlight, log, visualMatch

Supported assertion types:
- "text", "value", "visible","notVisible", "title", "url", "count", "checked", "selected", "exists", "notExists", "enabled", "disabled", "attribute", "style", "position", "elementCount", "containsText", "ariaLabel", "contrastRatio", "isVisibleInViewport", 
- "contains","equals","not contains","not equals","starts with","ends with","not starts with","not ends with"

Remember, if the input is peforming more than one task, then you break it down to multiple actions block in the outout json.

Do not assume anything of your own in the output. Strictly rely on the rules set.

User request:
"${userInput}"
`.trim();

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4.1-nano", // Or "gpt-4o" for better performance
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
    temperature: 0.2,
  });

  const output = chatResponse.choices[0]?.message?.content || "";
  console.log("output is: ", output);
  return output;
}
