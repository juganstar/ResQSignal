export function translateErrorMessage(field, message, t) {
  // Extract detail if needed
  if (typeof message === "object" && message?.detail) {
    message = message.detail;
  }

  // If it's an array with a single string (ex: ["CONTACT_LIMIT_REACHED::3::Basic"])
  if (Array.isArray(message) && message.length === 1 && typeof message[0] === "string") {
    message = message[0];
  }

  // Fallback for still unrecognized types
  if (typeof message !== "string") {
    return t("errors.unknown");
  }

  // 🛠️ Must come before `.toLowerCase()`
  if (message.startsWith("CONTACT_LIMIT_REACHED::")) {
    const parts = message.split("::");
    const max = parts[1];
    const plan = parts[2];
    return t("setup.contact_limit", { max, plan });
  }

  const msg = message.toLowerCase().trim();

  if (
    msg === "email_not_verified" ||
    msg === "email not verified" ||
    msg.includes("email not verified") ||
    msg.includes("e-mail is not verified")
  ) {
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

  return t("errors.unknown");
}
