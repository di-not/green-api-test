export function formatPhone(value: string) {
  const input = value.trim();
  const digits = input.replace(/\D/g, "");

  if (input.startsWith("+") && !input.startsWith("+7")) {
    return `+${digits.slice(0, 15).match(/.{1,3}/g)?.join(" ") ?? ""}`;
  }

  if (!digits) {
    return input === "+" ? "+" : "";
  }

  if (!input.startsWith("+") && digits.length > 10 && !/^[78]/.test(digits)) {
    return input;
  }

  const number = /^[78]/.test(digits)
    ? digits.slice(1, 11)
    : digits.slice(0, 10);
  let formatted = "+7";

  if (number.length > 0) {
    formatted += ` (${number.slice(0, 3)}`;
  }

  if (number.length > 3) {
    formatted += `) ${number.slice(3, 6)}`;
  }

  if (number.length > 6) {
    formatted += `-${number.slice(6, 8)}`;
  }

  if (number.length > 8) {
    formatted += `-${number.slice(8, 10)}`;
  }

  return formatted;
}

export function normalizePhone(value: string) {
  const input = value.trim();
  const digits = input.replace(/\D/g, "");

  if (input.startsWith("+")) {
    const isValidLength = digits.startsWith("7")
      ? digits.length === 11
      : /^[1-9]\d{6,14}$/.test(digits);

    return isValidLength ? `+${digits}` : "";
  }

  const number = /^[78]/.test(digits) ? digits.slice(1) : digits;

  return number.length === 10 ? `+7${number}` : "";
}
