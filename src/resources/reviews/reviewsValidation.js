import { body } from 'express-validator';

export const reviewsValidator = [
	body('comment').exists().withMessage('comment is mandatory'),
	body('rate').exists().withMessage('rate is mandatory max-5 rating'),
];
