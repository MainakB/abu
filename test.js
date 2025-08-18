// package.json deps:
//   "exceljs": "^4.4.0"  (or latest v4)
//   "fast-csv": "^5"     (optional; only if you want to write CSV of mismatches)

const fs = require('fs');
const Excel = require('exceljs'); // v4 has WorkbookReader for streaming

/**
 * Parse a single worksheet with headers [id, quantity, price].
 * Returns an async iterator of rows: { id, quantity, price } with normalized types.
 */
async function* streamRowsFromXlsx(filePath, sheetIndex = 0) {
  // Use the streaming reader (does not load entire file in memory)
  const reader = new Excel.stream.xlsx.WorkbookReader(filePath, {
    entries: 'emit',        // stream entries
    sharedStrings: 'cache', // keeps memory reasonable and fast
    styles: 'ignore',       // we don't need styles
    hyperlinks: 'ignore',
    worksheets: 'emit',
    zip: { storeEntries: true },
  });

  let currentSheetIdx = -1;

  for await (const worksheetReader of reader) {
    if (worksheetReader.type !== 'worksheet') continue;

    currentSheetIdx++;
    if (currentSheetIdx !== sheetIndex) {
      // Skip non-target sheets as they stream by
      for await (const row of worksheetReader) { /* drain */ }
      continue;
    }

    let isHeader = true;
    for await (const row of worksheetReader) {
      // row.values is 1-based index in exceljs; normalize
      // We expect columns: A=id, B=quantity, C=price
      if (!row || !row.values) continue;

      // Convert to a simple array, drop the 0th empty item
      const vals = Array.isArray(row.values) ? row.values.slice(1) : [];
      if (vals.length === 0) continue;

      if (isHeader) {
        isHeader = false;
        // Optionally validate headers here if you want
        continue;
      }

      const [idRaw, qtyRaw, priceRaw] = vals;
      // Normalize values
      const id = (idRaw ?? '').toString().trim();
      // Avoid NaN by safe number coercion
      const quantity = Number(qtyRaw);
      // Price: read as number if possible; if prices can be strings, normalize consistently
      const price = Number(priceRaw);

      if (!id) continue; // skip blank lines
      yield { id, quantity, price };
    }

    // Only read one sheet by default; break after target sheet
    break;
  }
}

/**
 * Load file2 (reference) into a Map keyed by id.
 * Each value = { price, quantity }
 */
async function loadReferenceMap(file2Path) {
  const ref = new Map();
  for await (const { id, quantity, price } of streamRowsFromXlsx(file2Path)) {
    // If duplicate ids might exist, you can decide a policy here (e.g., last one wins)
    ref.set(id, { quantity, price });
  }
  return ref;
}

/**
 * Compare file1 rows against file2 map.
 * Conditions:
 *  - every id in file1 must exist in file2
 *  - file2.quantity > 1
 *  - file1.price === file2.price  (with optional tolerance)
 *
 * Returns a summary and (optionally) writes mismatches as CSV.
 */
async function compareFiles({ file1Path, file2Path, mismatchCsvPath = null, floatTolerance = 0 }) {
  const refMap = await loadReferenceMap(file2Path);

  let checked = 0;
  let ok = 0;
  let missing = 0;
  let qtyFail = 0;
  let priceFail = 0;

  let csvStream;
  if (mismatchCsvPath) {
    const { format } = require('@fast-csv/format');
    csvStream = format({ headers: true });
    csvStream.pipe(fs.createWriteStream(mismatchCsvPath));
    csvStream.write(['id', 'reason', 'file1_price', 'file2_price', 'file2_quantity']);
  }

  function pricesEqual(a, b) {
    if (floatTolerance > 0) return Math.abs(a - b) <= floatTolerance;
    // Exact numeric equality (good if your prices are integers in cents or true numbers in Excel)
    return a === b;
  }

  for await (const row of streamRowsFromXlsx(file1Path)) {
    checked++;
    const { id, price: p1 } = row;
    const found = refMap.get(id);

    if (!found) {
      missing++;
      if (csvStream) csvStream.write({ id, reason: 'missing_in_file2', file1_price: p1, file2_price: '', file2_quantity: '' });
      continue;
    }

    if (!(found.quantity > 1)) {
      qtyFail++;
      if (csvStream) csvStream.write({ id, reason: 'quantity_not_gt_1', file1_price: p1, file2_price: found.price, file2_quantity: found.quantity });
      continue;
    }

    if (!pricesEqual(p1, found.price)) {
      priceFail++;
      if (csvStream) csvStream.write({ id, reason: 'price_mismatch', file1_price: p1, file2_price: found.price, file2_quantity: found.quantity });
      continue;
    }

    ok++;
  }

  if (csvStream) csvStream.end();

  return {
    checked_in_file1: checked,
    ok,
    missing_in_file2: missing,
    quantity_not_gt_1: qtyFail,
    price_mismatch: priceFail,
  };
}

// Example usage:
// (async () => {
//   const result = await compareFiles({
//     file1Path: 'file1.xlsx',
//     file2Path: 'file2.xlsx',
//     mismatchCsvPath: 'mismatches.csv', // or null to skip
//     // If prices might have tiny FP drift, set tolerance in currency units, e.g. 0.001
//     floatTolerance: 0,
//   });
//   console.log(result);
// })();
