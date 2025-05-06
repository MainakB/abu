import { pipeline } from "@xenova/transformers";
import { wordsToNumbers } from "words-to-numbers";

// const sentence = 'set value "42" in the third field ten times';
const sentence =
  // "Click third add button hundred times";
  //   "Enter abc in the fifth input box 3 times";
  //   "For twelve times click third add button";
  // "Click on seventh add button";
  // `Go to "https://amazon.com" three times`;
  // 'Enter "john" in "login" field';
  // 'Assert that title equals "abc"';
  //   'Enter "abc" in the fifth input field 3 times';
  //   'Type "abc" in the add to cart field';
  //   "Clear the third input field";
  'Go to to "amazon.com"';

const [classifier, slotExtractor] = await Promise.all([
  pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli"),
  pipeline("token-classification", "Xenova/bert-base-NER"),
]);

// Define possible intents
const candidateIntents = [
  "click",
  "tap",
  "input",
  "enter",
  "type",
  "clear",
  "empty",
  "navigate",
  "go to",
  "validate",
  "verify",
  "assert",
  "soft assert",
  "soft match",
  "match",
  "expect",
];

const intentResult = await classifier(sentence, candidateIntents);
const intent = intentResult.labels[0]; // Top intent prediction
console.log("🔍 intent: ", intent);

let assertIntent = null;
if (
  [
    "validate",
    "verify",
    "assert",
    "soft assert",
    "soft match",
    "match",
    "expect",
  ].includes(intent)
) {
  if (sentence.includes("not equals") || sentence.includes("not equal")) {
    assertIntent = "not equals";
  } else if (sentence.includes("equal")) {
    assertIntent = "equals";
  } else if (sentence.includes("not contain")) {
    assertIntent = "not contains";
  } else if (sentence.includes("contains") || sentence.includes("contain")) {
    assertIntent = "contains";
  } else if (
    sentence.includes("greater than") ||
    sentence.includes("more than")
  ) {
    assertIntent = "greater than";
  } else if (
    sentence.includes("less than") ||
    sentence.includes("lesser than")
  ) {
    assertIntent = "lesser than";
  } else if (
    sentence.includes("greater than equal") ||
    sentence.includes("more than equal")
  ) {
    assertIntent = "greater than equals";
  } else if (
    sentence.includes("less than equal") ||
    sentence.includes("lesser than equal")
  ) {
    assertIntent = "lesser than equals";
  }
}

const nerResult = await slotExtractor(sentence, { ignore_labels: [] });

let inputValue = null;
let repetition = null;
let targetPosition = null;

const ordinalWords = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

const wordToNum = {
  once: 1,
  twice: 2,
  thrice: 3,
};

const resolveTargetPos = (word, splitBy) => {
  let num = word.split(splitBy);

  if (Number.isNaN(Number(num[0]))) {
    const wn = wordsToNumbers(num[0]);
    if (!Number.isNaN(Number(wn))) {
      targetPosition = wn;
    }
  } else {
    targetPosition = num[0];
  }
};

for (const ent of nerResult) {
  const word = ent.word.toLowerCase();

  if (ent.entity_group === "MISC" || ent.entity_group === "PER") {
    inputValue = ent.word;
  }

  // 🔍 Additional fallback: extract quoted text manually for inputValue
  if (!inputValue) {
    const match = sentence.match(/"(.*?)"/);
    if (match) {
      inputValue = match[1];
    }
  }

  // Handle "once", "twice", "thrice"
  if (wordToNum[word] && repetition === null) {
    repetition = wordToNum[word];
  }

  const fullMatch = sentence.match(/\s+([a-z]+)\s+times?/);

  if (fullMatch) {
    const normalized = wordsToNumbers(fullMatch[1].trim());
    if (typeof normalized === "number") {
      repetition = normalized;
    }
  } else if (word.match(/^\d+$/)) {
    const after = sentence.slice(ent.start).match(/\d+\s+times?/);
    if (after) repetition = parseInt(word, 10);
  }

  // Target: look for ordinals
  if (ordinalWords[word]) {
    targetPosition = ordinalWords[word];
  } else {
    if (word.endsWith("th")) {
      targetPosition = resolveTargetPos(word, "th");
    } else if (word.endsWith("st")) {
      targetPosition = resolveTargetPos(word, "st");
    } else if (word.endsWith("nd")) {
      targetPosition = resolveTargetPos(word, "nd");
    } else if (word.endsWith("rd")) {
      targetPosition = resolveTargetPos(word, "rd");
    }

    targetPosition = Number.isNaN(Number(targetPosition))
      ? wordsToNumbers(word)
      : Number(targetPosition);
  }
}

async function extractFieldName(sentence, intent) {
  // Define compound UI element identifiers (multi-word ones first)
  const compoundFieldIdentifiers = [
    "input field",
    "input box",
    "text field",
    "text box",
    "text area",
    "text input",
    "form field",
    "entry field",
    "textarea",
    "search box",
  ];

  // Define single-word UI element identifiers
  const singleFieldIdentifiers = [
    "field",
    "box",
    "input",
    "textarea",
    "entry",
    "textbox",
    "form",
  ];

  // Combined list for comprehensive matching
  const allFieldIdentifiers = [
    ...compoundFieldIdentifiers,
    ...singleFieldIdentifiers,
  ];

  // Button identifiers
  const buttonIdentifiers = [
    "button",
    "link",
    "tab",
    "icon",
    "menu",
    "option",
    "dropdown",
    "select",
  ];

  // Position-related words to exclude
  const positionWords = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
  ];

  // Command verbs to exclude
  const commandVerbs = [
    "click",
    "tap",
    "press",
    "select",
    "choose",
    "enter",
    "input",
    "type",
    "clear",
    "empty",
  ];

  // Extract quoted texts from the sentence
  const quotedTexts = [];
  let match;
  const quoteRegex = /"([^"]+)"|'([^']+)'/g;

  while ((match = quoteRegex.exec(sentence)) !== null) {
    const quoted = match[1] || match[2];
    if (quoted) {
      quotedTexts.push(quoted);
    }
  }

  // For input/enter intents, handle special case with position words
  if (intent === "input" || intent === "enter" || intent === "type") {
    const sentenceLower = sentence.toLowerCase();

    // Handle cases like "Enter 'abc' in the fifth input box 3 times"
    // Look for pattern like "the [position] [field identifier]"
    for (const identifier of allFieldIdentifiers) {
      const positionPattern = new RegExp(
        `the\\s+(${positionWords.join("|")})\\s+${identifier}\\b`,
        "i"
      );

      if (sentenceLower.match(positionPattern)) {
        // In this case, there's no explicit field name - the identifier itself is the field
        return identifier.split(/\s+/)[0]; // Return first word of identifier like "input" from "input box"
      }
    }

    // Try compound identifiers first (to avoid partial matches)
    for (const identifier of compoundFieldIdentifiers) {
      const pattern = new RegExp(
        `in\\s+(?:the\\s+)?([\\w\\s]+?)\\s+${identifier}\\b`,
        "i"
      );
      const match = sentenceLower.match(pattern);

      if (match && match[1]) {
        const fieldName = match[1].trim();
        const fieldNameWords = fieldName.split(/\s+/);

        // If the field name is just a position word, return the identifier instead
        if (
          fieldNameWords.length === 1 &&
          positionWords.includes(fieldNameWords[0])
        ) {
          return identifier.split(/\s+/)[0]; // Return first word of identifier
        }

        // Found a match with a compound identifier
        return fieldName;
      }
    }

    // Then try single-word identifiers
    for (const identifier of singleFieldIdentifiers) {
      const pattern = new RegExp(
        `in\\s+(?:the\\s+)?([\\w\\s]+?)\\s+${identifier}\\b`,
        "i"
      );
      const match = sentenceLower.match(pattern);

      if (match && match[1]) {
        // Found a match with a single-word identifier
        const fieldName = match[1].trim();
        const fieldNameWords = fieldName.split(/\s+/);

        // If the field name is just a position word, return the identifier instead
        if (
          fieldNameWords.length === 1 &&
          positionWords.includes(fieldNameWords[0])
        ) {
          return identifier; // Return the identifier itself
        }

        // Check if the extracted name ends with a word that's part of compound identifiers
        if (fieldNameWords.length > 1) {
          const lastWord = fieldNameWords[fieldNameWords.length - 1];

          // Check if the last word is a potential identifier
          if (singleFieldIdentifiers.includes(lastWord)) {
            // Remove the last word as it's likely part of the identifier
            return fieldNameWords.slice(0, -1).join(" ");
          }
        }

        return fieldName;
      }
    }
  }

  if (intent === "clear" || intent === "empty") {
    const sentenceLower = sentence.toLowerCase();

    // Handle pattern like "Clear the [fieldname] [identifier]"
    for (const identifier of allFieldIdentifiers) {
      const clearPattern = new RegExp(
        `(?:clear|empty)\\s+(?:the\\s+)?([\\w\\s]+?)\\s+${identifier}\\b`,
        "i"
      );
      const match = sentenceLower.match(clearPattern);

      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }

  // For click/tap intents, handle button patterns
  if (intent === "click" || intent === "tap") {
    // Look for a pattern like: [position word] [field] [button identifier]
    // This direct matching approach is best for examples like "Click third add button hundred times"
    const words = sentence.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (
        positionWords.includes(words[i]) &&
        i + 2 < words.length &&
        buttonIdentifiers.includes(words[i + 2])
      ) {
        // We found a pattern like "third add button"
        return words[i + 1];
      }
    }

    // Check for general button patterns
    for (const identifier of buttonIdentifiers) {
      const buttonPattern = new RegExp(
        `\\b([\\w\\s]+?)\\s+${identifier}\\b`,
        "i"
      );
      const buttonMatch = sentence.match(buttonPattern);

      if (buttonMatch && buttonMatch[1]) {
        let buttonName = buttonMatch[1].trim();
        let words = buttonName.toLowerCase().split(/\s+/);

        // Filter out command verbs if they're at the beginning
        if (words.length > 0 && commandVerbs.includes(words[0])) {
          words = words.slice(1);
        }

        // Check if the button name starts with a position word
        if (words.length > 0 && positionWords.includes(words[0])) {
          // Remove the position word
          words = words.slice(1);
        }

        if (words.length > 0) {
          return words.join(" ");
        } else {
          // If we stripped everything, return the identifier itself
          return identifier;
        }
      }
    }
  }

  // If we've reached here and have quoted text, use it as a fallback
  if (quotedTexts.length > 0) {
    // If we have multiple quoted strings, try to guess which one is the field name
    if (quotedTexts.length >= 2 && (intent === "input" || intent === "enter")) {
      // Assume the second quoted string might be the field name in input scenarios
      return quotedTexts[1];
    }
    return quotedTexts[0];
  }

  const entities = await slotExtractor(sentence, {
    aggregation_strategy: "simple",
  });

  // Extract potential entities
  const entityCandidates = entities
    .filter((entity) => ["ORG", "MISC", "LOC"].includes(entity.entity_group))
    .sort((a, b) => b.score - a.score);

  if (entityCandidates.length > 0) {
    return entityCandidates[0].word;
  }

  // No field name found
  return null;
}

const fieldNameComputed = await extractFieldName(sentence, intent);
const fieldName = [
  "input",
  "textbox",
  "button",
  "text",
  "textarea",
  "link",
  "hyperlink",
  "dropdown",
].includes(fieldNameComputed)
  ? null
  : fieldNameComputed;

// ---------- Final Output ----------
console.log({
  intent,
  inputValue,
  repetition,
  targetPosition,
  assertIntent,
  fieldName,
});
