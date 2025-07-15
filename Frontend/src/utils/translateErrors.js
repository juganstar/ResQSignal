export function translateErrorMessage(field, message, t) {
  // Extract detail if wrapped
  if (typeof message === "object" && message?.detail) {
    message = message.detail;
  }

  // Handle array with one string inside
  if (Array.isArray(message) && message.length === 1 && typeof message[0] === "string") {
    message = message[0];
  }

  if (typeof message !== "string") return t("errors.unknown");

  // Handle special system-style codes
  if (message.startsWith("CONTACT_LIMIT_REACHED::")) {
    const parts = message.split("::");
    const max = parts[1];
    const plan = parts[2];
    return t("setup.contact_limit", { max, plan });
  }

  const msg = message.toLowerCase().trim();

  // === Specific known error matches ===
  if (msg === "email_not_verified" || msg.includes("email not verified")) {
    return t("errors.emailNotVerified");
  }

  if (msg.includes("a user with that username already exists")) {
    return t("errors.usernameExists");
  }

  if (msg.includes("a user is already registered with this e-mail address")) {
    return t("errors.emailExists");
  }

  if (msg.includes("this password is too short")) {
    return t("errors.passwordTooShort");
  }

  if (msg.includes("this password is too common")) {
    return t("errors.passwordTooCommon");
  }

  if (msg.includes("this password is entirely numeric")) {
    return t("errors.passwordAllDigits");
  }

  if (
    msg.includes("passwords do not match") ||
    msg.includes("password fields didn’t match") ||
    msg.includes("password fields didn't match") ||
    msg.includes("password mismatch")
  ) {
    return t("errors.passwordsDontMatch");
  }

  if (msg.includes("enter a valid email address")) {
    return t("errors.invalidEmail");
  }

  if (
    msg.includes("invalid credentials") ||
    msg.includes("unable to log in") ||
    msg.includes("no active account")
  ) {
    return t("errors.invalidCredentials");
  }

  if (msg === "this field may not be blank." && field) {
    return t("errors.fieldBlank", { field });
  }

  // Fallback to raw message if no translation match
  return message;
}
