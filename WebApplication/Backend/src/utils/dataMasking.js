export const maskSensitiveData = (text) => {
    if (!text) return "";

    // Mask IPv4 addresses (simple pattern, usually sufficient for logs)
    // Matches most standard IP patterns
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

    // Mask Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

    return text
        .replace(ipRegex, '[IP_REDACTED]')
        .replace(emailRegex, '[EMAIL_REDACTED]');
};
