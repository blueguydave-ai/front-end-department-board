// js/utils/validators.js
class Validators {
    static validateSignupForm(formData) {
        const errors = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!Helpers.validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Matric number validation
        if (!formData.matricNumber.trim()) {
            errors.matricNumber = 'Matric number is required';
        }

        // Level validation
        if (!formData.level) {
            errors.level = 'Level is required';
        } else if (![100, 200, 300, 400, 500].includes(parseInt(formData.level))) {
            errors.level = 'Please select a valid level';
        }

        // Student type validation
        if (!formData.studentType) {
            errors.studentType = 'Student type is required';
        }

        // Phone validation
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!Helpers.validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateLoginForm(formData) {
        const errors = {};

        if (!formData.identifier.trim()) {
            errors.identifier = 'Email or matric number is required';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateProfileForm(formData) {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!Helpers.validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!Helpers.validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}