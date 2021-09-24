import express from 'express';

import uniqid from 'uniqid';
import createHttpError from 'http-errors';

import { parseFile } from '../cloudinary.js';
import { mediaValidator } from './mediaValidation.js';
import { validationResult } from 'express-validator';
import { reviewsValidator } from '../reviews/reviewsValidation.js';
import {
	readMedia,
	writeMedia,
	readReviews,
	writeReviews,
	saveImages,
} from '../../utilis.js';

const mediaRouter = express.Router();

/// get media
mediaRouter.get('/', async (req, res, next) => {
	console.log(req.query.category);
	try {
		const media = await readMedia();
		const reviews = await readReviews();

		res.status(200).send({ media, reviews });
	} catch (error) {
		next(error);
	}
});
mediaRouter.get('/:id', async (req, res, next) => {
	try {
		const media = await readMedia();

		const reviews = await readReviews();

		const filteredMedia = media.find((media) => media.imdbID === req.params.id);
		const filteredReview = reviews.find(
			(review) => review.elementId === req.params.id,
		);
		console.log(filteredReview, filteredMedia);

		if (filteredMedia) {
			let allReviews = reviews.filter(
				(review) => review.elementId === req.params.id,
			);
			res.send(allReviews);
		} else {
			next(createHttpError(404, `id ${req.params.id} not found `));
		}
	} catch (error) {
		next(error);
	}
});
mediaRouter.delete('/:id', async (req, res, next) => {
	try {
		const media = await readMedia();
		const filteredmedia = media.filter(
			(product) => product.imdbID !== req.params.id,
		);
		const checkId = media.findIndex(
			(product) => product.imdbID === req.params.id,
		);
		console.log(checkId);
		if (parseInt(checkId) !== -1) {
			writeMedia(filteredmedia);
			res.status(204).send();
		} else {
			next(createHttpError(404, `id ${req.params.id} not found `));
		}
	} catch (error) {
		next(error);
	}
});
mediaRouter.post(
	'/',
	parseFile.single('poster'),
	mediaValidator,
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				next(createHttpError(400, `bad request`));
			} else {
				const { Title, Year, Type } = req.body;

				const newMedia = {
					Title,
					Year,
					Type,
					imdbID: uniqid(),
					Poster: req.file.path,
					createdAt: new Date(),
				};
				const media = await readMedia();

				media.push(newMedia);

				await writeMedia(media);
				res.status(201).send(newMedia);
			}
		} catch (error) {
			next(error);
		}
	},
);
mediaRouter.put(
	'/:id',
	parseFile.single('poster'),
	mediaValidator,
	async (req, res, next) => {
		const errorsList = validationResult(req);
		if (!errorsList.isEmpty()) {
			next(createHttpError(400, { message: errorsList }));
		} else {
			try {
				const media = await readMedia();
				const mediaIndex = media.findIndex(
					(product) => product.imdbID === req.params.id,
				);
				if (mediaIndex !== -1) {
					const previousData = media[mediaIndex];
					const { Title, Year, Type } = req.body;
					const updatedData = {
						...previousData,
						Title,
						Year,
						Type,
						Poster: req.file.path,
						updatedAt: new Date(),
						imdbID: req.params.id,
					};
					media[mediaIndex] = updatedData;
					await writeMedia(media);
					res.send(updatedData);
				} else {
					next(
						createHttpError(404),
						`No product found with id ${req.params.id}`,
					);
				}
			} catch (error) {
				next(error);
			}
		}
	},
);
mediaRouter.post('/:id/reviews', reviewsValidator, async (req, res, next) => {
	try {
		const media = await readMedia();
		const reviews = await readReviews();
		const reviewIndex = media.findIndex(
			(product) => product.imdbID === req.params.id,
		);
		console.log(media);
		if (reviewIndex !== -1) {
			console.log(reviews);
			console.log(reviews[reviewIndex]);

			const { comment, rate } = req.body;
			const latestReview = {
				comment,
				rate,
				elementId: req.params.id,
				_id: uniqid(),
				createdAt: new Date(),
			};
			reviews.push(latestReview);
			await writeReviews(reviews);
			res.send(reviews);
		} else {
			next(createHttpError(404), `No product found with id ${req.params.id}`);
		}
	} catch (error) {
		next(error);
	}
});
mediaRouter.delete('/:id/reviews', reviewsValidator, async (req, res, next) => {
	try {
		const reviews = await readReviews();
		const reviewIndex = reviews.find(
			(product) => product.elementId === req.params.id,
		);
		if (reviewIndex) {
			let allReviews = reviews.filter(
				(review) => review.elementId !== req.params.id,
			);
			console.log(allReviews);
			await writeReviews(allReviews);
			res.send('deleted');
		} else {
			next(createHttpError(404), `No product found with id ${req.params.id}`);
		}
	} catch (error) {
		next(error);
	}
});

export default mediaRouter;
