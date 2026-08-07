export function cleanLabel(label: string) {
  let clean = label.replace(/^APPARATUS\s+/i, "");
  if (clean === clean.toUpperCase()) {
    clean = clean
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
  }
  return clean;
}

export const SCRAMBLE_CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

export function scrambleWordLastCharFirst(
  text: string,
  waveCenter: number,
  waveWidth: number = 2,
  frame: number = 0
): string {
  const len = text.length;
  let out = "";
  for (let i = 0; i < len; i++) {
    const char = text[i];
    if (char === " " || char === "-" || char === "/") {
      out += char;
    } else if (i >= waveCenter - waveWidth && i <= waveCenter) {
      out += SCRAMBLE_CHAR_SET[(frame + i * 3) % SCRAMBLE_CHAR_SET.length];
    } else {
      out += char;
    }
  }
  return out;
}
