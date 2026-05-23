/**
 * Software Class: Validator
 * Centralised, reusable input-validation rules for the Binge platform.
 * Every validation method returns { valid: bool, message: string }.
 */
class Validator {

    // ── Primitives ────────────────────────────────────────────

    /** Ensure all listed fields are non-empty strings / truthy values. */
    static requireFields(fields = []) {
        for (const [name, value] of fields) {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                return { valid: false, message: `${name} is required.` };
            }
        }
        return { valid: true, message: '' };
    }

    /** Validate an e-mail address format. */
    static validateEmail(email) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return { valid: ok, message: ok ? '' : 'Please enter a valid email address.' };
    }

    /** Validate password meets minimum length. */
    static validatePassword(password, minLength = 8) {
        const ok = typeof password === 'string' && password.length >= minLength;
        return { valid: ok, message: ok ? '' : `Password must be at least ${minLength} characters.` };
    }

    /** Confirm two password strings match. */
    static passwordsMatch(password, confirm) {
        const ok = password === confirm;
        return { valid: ok, message: ok ? '' : 'Passwords do not match.' };
    }

    /** Validate a string has a minimum length. */
    static minLength(value, min, fieldName = 'Field') {
        const ok = typeof value === 'string' && value.trim().length >= min;
        return { valid: ok, message: ok ? '' : `${fieldName} must be at least ${min} characters.` };
    }

    /** Validate a numeric value is positive (> 0). */
    static isPositiveNumber(value, fieldName = 'Value') {
        const n = Number(value);
        const ok = !isNaN(n) && n > 0;
        return { valid: ok, message: ok ? '' : `${fieldName} must be a positive number.` };
    }

    /** Validate a value is one of the allowed options. */
    static isOneOf(value, options = [], fieldName = 'Field') {
        const ok = options.includes(value);
        return { valid: ok, message: ok ? '' : `${fieldName} must be one of: ${options.join(', ')}.` };
    }

    // ── Composite helpers ─────────────────────────────────────

    /** Run all registration validations. Returns first failing result or {valid:true}. */
    static validateRegistration({ firstName, lastName, email, password, confirmPassword, country, role, channelName }) {
        const checks = [
            Validator.requireFields([
                ['First Name', firstName], ['Last Name', lastName],
                ['Email', email], ['Password', password],
                ['Country', country], ['Role', role]
            ]),
            Validator.minLength(firstName, 2, 'First Name'),
            Validator.minLength(lastName,  2, 'Last Name'),
            Validator.validateEmail(email),
            Validator.validatePassword(password),
            Validator.passwordsMatch(password, confirmPassword),
        ];

        if (role === 'creator') {
            checks.push(Validator.requireFields([['Channel Name', channelName]]));
        }

        for (const result of checks) {
            if (!result.valid) return result;
        }
        return { valid: true, message: '' };
    }

    /** Run all video-upload validations. Returns first failing result or {valid:true}. */
    static validateVideoUpload({ title, videoUrl, duration, categoryId }) {
        const checks = [
            Validator.requireFields([
                ['Title', title], ['Video URL', videoUrl],
                ['Duration', duration], ['Category', categoryId]
            ]),
            Validator.minLength(title, 3, 'Title'),
            Validator.isPositiveNumber(duration, 'Duration'),
        ];
        for (const result of checks) {
            if (!result.valid) return result;
        }
        return { valid: true, message: '' };
    }
}

module.exports = Validator;
