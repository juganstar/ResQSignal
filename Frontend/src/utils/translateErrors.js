export function translateErrorMessage(field, message, t) {
  // If it's an object with `.detail`
  if (typeof message === "object" && message?.detail) {
    message = message.detail;
  }

  // 🛠️ NEW: If it's an array like ["EMAIL_NOT_VERIFIED"]
  if (Array.isArray(message) && message.length > 0) {
    message = message[0];
  }

  // If still not string, fallback
  if (typeof message !== "string") {
    return t("errors.unknown");
  }

  // CONTACT_LIMIT_REACHED should happen before lowercase
  if (message.startsWith("CONTACT_LIMIT_REACHED::")) {
    const parts = message.split("::");
    const max = parts[1];
    const plan = parts[2];
    return t("setup.contact_limit", { max, plan });
  }

  const msg = message.toLowerCase().trim();

  // 💥 The only real fix
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

  if (msg.includes("passwords do not match")) {
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

  // Fallback
  return t("errors.unknown");
}
