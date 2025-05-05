import { pipeline } from "@xenova/transformers";
import { wordsToNumbers } from "words-to-numbers";

// const sentence = 'set value "42" in the third field ten times';
const sentence = "Click third add button hundred times";
//   "Enter abc in the fifth input box 3 times";
//   "For twelve times click third add button";
// "Click on seventh add button";
// `Go to "https://amazon.com" three times`;
// 'Enter "john" in "login" field';
// 'Assert that title equals "abc"';
// 'Enter "abc" in the fifth input box 3 times';
//   'Enter "abc" in the add to cart field';

// ---------- STEP 1: Zero-shot Intent Classification ----------
const intentClassifier = await pipeline(
  "zero-shot-classification",
  "Xenova/mobilebert-uncased-mnli"
);

// Define possible intents
const candidateIntents = [
  "click",
  "tap",
  "input",
  "enter",
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

const intentResult = await intentClassifier(sentence, candidateIntents);
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
  // Top intent prediction
}
console.log("🔍 assertIntent: ", assertIntent);

// ---------- Step 2: Pretrained NER for slot info ----------
const slotExtractor = await pipeline(
  "token-classification",
  "Xenova/bert-base-NER"
  //   {
  //     aggregation_strategy: "simple",
  //   }
);

const nerResult = await slotExtractor(sentence, { ignore_labels: [] });
// console.log("🔍 Raw NER Output:", nerResult);

// ---------- Step 3: Heuristic Field Mapping ----------
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
  // Optional: fallback for more word-numbers if you want
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

  // Possible input value: numeric or misc (fallback logic)
  if (ent.entity_group === "MISC" || ent.entity_group === "PER") {
    inputValue = ent.word;
    // if (!inputValue && /^\d+$/.test(word)) inputValue = word;
  }

  // 🔍 Additional fallback: extract quoted text manually for inputValue
  if (!inputValue) {
    const match = sentence.match(/"(.*?)"/);
    if (match) {
      inputValue = match[1];
    }
  }

  const repetitionClassifier = await pipeline(
    "zero-shot-classification",
    "Xenova/mobilebert-uncased-mnli"
  );

  // Repetition: look for a number + "times"
  //   if (word.match(/^\d+$/)) {
  //     const after = sentence.slice(ent.start).match(/^\d+\s+times?/);
  //     if (after) repetition = parseInt(word);
  //   }

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

// New function to extract field names using a specialized approach
// async function extractFieldName(sentence, intent) {
//   // Initialize a dedicated field name recognizer
//   const fieldRecognizer = await pipeline(
//     "token-classification",
//     "Xenova/bert-base-NER" // Pre-trained NER model
//   );

//   // Process the sentence to recognize entities
//   const entities = await fieldRecognizer(sentence, {
//     aggregation_strategy: "simple", // This groups entity tokens together
//   });

//   // Extract potential field candidates based on intent and entities
//   let fieldCandidates = [];

//   // For click/tap intents, look specifically for UI element references
//   if (intent === "click" || intent === "tap") {
//     // Search for elements that might be buttons, links, etc.
//     const uiElementPatterns = sentence.match(
//       /(\w+)\s+(button|link|tab|icon|menu)/gi
//     );

//     if (uiElementPatterns) {
//       for (const match of uiElementPatterns) {
//         const parts = match.split(/\s+/);
//         if (parts.length >= 2) {
//           fieldCandidates.push({
//             field: parts[0],
//             score: 0.85, // High confidence for direct mentions
//             source: "pattern",
//           });
//         }
//       }
//     }
//   }

//   // For input/enter intents, look for field references
//   if (intent === "input" || intent === "enter") {
//     // Look for input field mentions
//     const inputPatterns = sentence.match(
//       /in\s+(?:the\s+)?(?:"|')?(\w+)(?:"|')?\s+(?:field|box|input)/i
//     );

//     if (inputPatterns && inputPatterns[1]) {
//       fieldCandidates.push({
//         field: inputPatterns[1],
//         score: 0.9,
//         source: "pattern",
//       });
//     }
//   }

//   // Add entities from the BERT NER model as candidates
//   for (const entity of entities) {
//     // We're interested in entities that might be field names
//     // ORG, MISC, and LOC can sometimes be UI elements
//     if (["ORG", "MISC", "LOC", "PER"].includes(entity.entity_group)) {
//       fieldCandidates.push({
//         field: entity.word.toLowerCase(),
//         score: entity.score,
//         source: "bert",
//       });
//     }
//   }

//   // Use a zero-shot classifier to determine which candidate is most likely to be a field
//   if (fieldCandidates.length > 0) {
//     // Sort by confidence score
//     fieldCandidates.sort((a, b) => b.score - a.score);

//     // Use a zero-shot classifier to validate the top candidates
//     const classifier = await pipeline(
//       "zero-shot-classification",
//       "Xenova/mobilebert-uncased-mnli"
//     );

//     // Prepare a more targeted list for classification
//     const topCandidates = fieldCandidates.slice(0, 3); // Take top 3 candidates

//     const fieldValidations = await Promise.all(
//       topCandidates.map(async (candidate) => {
//         const hypothesis = `"${candidate.field}" is a UI element or field name in "${sentence}"`;
//         const result = await classifier(sentence, [hypothesis]);
//         return {
//           ...candidate,
//           validationScore: result.scores[0],
//         };
//       })
//     );

//     // Final ranking combining original confidence and validation score
//     fieldValidations.sort(
//       (a, b) =>
//         b.score * 0.4 +
//         b.validationScore * 0.6 -
//         (a.score * 0.4 + a.validationScore * 0.6)
//     );

//     // Return the highest scoring field name if it passes threshold
//     if (
//       fieldValidations.length > 0 &&
//       fieldValidations[0].validationScore > 0.6
//     ) {
//       return fieldValidations[0].field;
//     }
//   }

//   // Try extracting from quoted text as a fallback
//   const quotedText = sentence.match(/"([^"]*)"|'([^']*)'/);
//   if (quotedText && (quotedText[1] || quotedText[2])) {
//     return (quotedText[1] || quotedText[2]).toLowerCase();
//   }

//   // No field name found
//   return null;
// }

async function extractFieldName(sentence, intent) {
  // Initialize a dedicated field name recognizer
  const fieldRecognizer = await pipeline(
    "token-classification",
    "Xenova/bert-base-NER"
  );

  // Process the sentence to recognize entities
  const entities = await fieldRecognizer(sentence, {
    aggregation_strategy: "simple", // This groups entity tokens together
  });

  // First, check for quoted field names - highest priority
  const quotedTexts = [];
  let match;
  const quoteRegex = /"([^"]+)"|'([^']+)'/g;

  while ((match = quoteRegex.exec(sentence)) !== null) {
    // match[1] or match[2] contains the text inside quotes
    const quoted = match[1] || match[2];
    if (quoted) {
      quotedTexts.push(quoted);
    }
  }

  // For input/enter intents with quoted field names
  if ((intent === "input" || intent === "enter") && quotedTexts.length >= 2) {
    // Check if one of the quoted strings is followed by "field", "input", etc.
    const fieldIndex = sentence.toLowerCase().indexOf(" field");
    if (fieldIndex > 0) {
      // Find the quoted text closest to "field"
      let closestField = null;
      let minDistance = Infinity;

      for (const quotedText of quotedTexts) {
        const textIndex = sentence.indexOf(quotedText);
        const distance = Math.abs(fieldIndex - (textIndex + quotedText.length));

        if (distance < minDistance) {
          minDistance = distance;
          closestField = quotedText;
        }
      }

      if (closestField) return closestField;
    }
  }

  // Extract potential field candidates using patterns
  let fieldCandidates = [];

  // For click/tap intents, look for multi-word button names
  if (intent === "click" || intent === "tap") {
    // Check for quoted button names first
    if (quotedTexts.length > 0) {
      // If there's a quoted text that appears before "button", it's likely our field
      for (const quotedText of quotedTexts) {
        const textIndex = sentence.indexOf(quotedText);
        const afterText = sentence.substring(textIndex + quotedText.length);

        if (afterText.match(/\s+button/i)) {
          return quotedText; // High confidence match
        }
      }
    }

    // Check for non-quoted multi-word buttons
    // This pattern looks for words followed by "button"
    const buttonPattern = /\b([\w\s]+?)\s+button\b/i;
    const buttonMatch = sentence.match(buttonPattern);

    if (buttonMatch && buttonMatch[1]) {
      const buttonName = buttonMatch[1].trim();
      // Make sure it's not just a position word like "third"
      if (
        ![
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
        ].includes(buttonName)
      ) {
        fieldCandidates.push({
          field: buttonName,
          score: 0.9,
          source: "button_pattern",
        });
      }
    }
  }

  // For input/enter intents, check for multi-word field patterns
  if (intent === "input" || intent === "enter") {
    // Pattern that looks for "in the X field" or "in X field"
    const fieldPattern = /in\s+(?:the\s+)?([\w\s]+?)\s+field/i;
    const fieldMatch = sentence.match(fieldPattern);

    if (fieldMatch && fieldMatch[1]) {
      const fieldName = fieldMatch[1].trim();
      fieldCandidates.push({
        field: fieldName,
        score: 0.85,
        source: "field_pattern",
      });
    }
  }

  // Add entities from the BERT NER model as candidates
  for (const entity of entities) {
    if (["ORG", "MISC", "LOC", "PER"].includes(entity.entity_group)) {
      fieldCandidates.push({
        field: entity.word,
        score: entity.score,
        source: "bert",
      });
    }
  }

  // If we have candidates, use a classifier to validate them
  if (fieldCandidates.length > 0) {
    // Sort by confidence score
    fieldCandidates.sort((a, b) => b.score - a.score);

    // Validate top candidates
    const classifier = await pipeline(
      "zero-shot-classification",
      "Xenova/mobilebert-uncased-mnli"
    );

    // Take top candidates for validation
    const topCandidates = fieldCandidates.slice(
      0,
      Math.min(3, fieldCandidates.length)
    );

    const fieldValidations = await Promise.all(
      topCandidates.map(async (candidate) => {
        const hypothesis = `"${candidate.field}" is a UI element mentioned in this instruction`;
        const result = await classifier(sentence, [hypothesis]);
        return {
          ...candidate,
          validationScore: result.scores[0],
        };
      })
    );

    // Calculate final score and sort
    fieldValidations.sort(
      (a, b) =>
        b.score * 0.3 +
        b.validationScore * 0.7 -
        (a.score * 0.3 + a.validationScore * 0.7)
    );

    // Return the highest scoring field name that passes threshold
    if (
      fieldValidations.length > 0 &&
      fieldValidations[0].validationScore > 0.6
    ) {
      return fieldValidations[0].field;
    }
  }

  // If no field name was found yet, use quoted text as fallback
  if (quotedTexts.length > 0) {
    return quotedTexts[0]; // Return the first quoted text
  }

  // No field name found
  return null;
}

const fieldName = await extractFieldName(sentence, intent);

// ---------- Final Output ----------
console.log({
  intent,
  inputValue,
  repetition,
  targetPosition,
  assertIntent,
  fieldName,
});
