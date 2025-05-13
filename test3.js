function isHumanReadable(value) {
  if (!value || typeof value !== "string") return false;

  const trimmed = value.trim();

  // Adjusted classPattern — now case-sensitive, expects underscore/dash/number
  const classPattern = /^[-_a-z0-9]+$/;
  const wordCount = trimmed.split(/\s+/).length;
  const uuidPattern =
    /^[a-f0-9]{8}-?[a-f0-9]{4,}-?[a-f0-9]{4,}-?[a-f0-9]{4,}-?[a-f0-9]{12}$/i;

  return (
    !classPattern.test(trimmed) &&
    !uuidPattern.test(trimmed) &&
    (wordCount > 1 || /^[A-Za-z]+$/.test(trimmed))
  );
}

const res = isHumanReadable("Search for products");
console.log(res);
