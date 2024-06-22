const { body } = require('express-validator');

exports.validateLogin = [
    body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

    body('password')
    .trim()
    .notEmpty().withMessage('password is required'),
];

