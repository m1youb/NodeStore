import { body, validationResult } from 'express-validator';

// Validation rules for signup
export const signupValidation = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2-100 characters')
        .escape(),

    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3-30 characters')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 3 }).withMessage('Password must be at least 3 characters')
];

// Validation rules for login
export const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .escape(),

    body('password')
        .notEmpty().withMessage('Password is required')
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};
