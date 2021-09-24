import { body } from 'express-validator';

export const mediaValidator = [
	body('Title').exists().withMessage('Title is mandatory'),
	body('Year').exists().withMessage('Year is mandatory'),
	body('Type').exists().withMessage('Type is mandatory'),
];
