export function translateErrorMessage(field, message, t) {
  // Extract inner detail if nested
  if (typeof message === "object" && message?.detail) {
    message = message.detail;
  }

  // Handle single-item arrays
  if (Array.isArray(message) && message.length === 1 && typeof message[0] === "string") {
    message = message[0];
  }

  // If still not a string, unknown
  if (typeof message !== "string") return t("errors.unknown");

  // Normalize message for comparison
  const msg = message.toLowerCase().trim();

  // ==== Custom structured codes ====
  if (msg.startsWith("contact_limit_reached::")) {
    const [_, max, plan] = message.split("::");
    return t("setup.contact_limit", { max, plan });
  }

  // ==== Common known messages ====
  if (msg.includes("email not verified")) return t("errors.emailNotVerified");
  if (msg.includes("a user with that username already exists")) return t("errors.usernameExists");
  if (msg.includes("a user is already registered with this e-mail address")) return t("errors.emailExists");
  if (msg.includes("this password is too short")) return t("errors.passwordTooShort");
  if (msg.includes("this password is too common")) return t("errors.passwordTooCommon");
  if (msg.includes("this password is entirely numeric")) return t("errors.passwordAllDigits");
  if (
    msg.includes("passwords do not match") ||
    msg.includes("password fields didn’t match") ||
    msg.includes("password fields didn't match") ||
    msg.includes("password mismatch")
  ) {
    return t("errors.passwordsDontMatch");
  }
  if (msg.includes("enter a valid email address")) return t("errors.invalidEmail");
  if (
    msg.includes("invalid credentials") ||
    msg.includes("unable to log in") ||
    msg.includes("no active account")
  ) {
    return t("errors.invalidCredentials");
  }

  // ==== Field-specific generic fallback ====
  if (msg.includes("may not be blank")) {
    return field
      ? t("errors.fieldBlank", { field })
      : t("errors.fieldBlankGeneric");
  }

  // Default: return raw backend string (for debug/unknowns)
  return message;
}
