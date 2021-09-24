import fs from 'fs-extra';

import { join } from 'path';

const { readJSON, writeJSON, writeFile } = fs;

const publicFolderPathForImage = join(process.cwd(), 'public/media/images');
export const mediaJsonPath = join(
	process.cwd(),
	'src/resources/media/media.json',
);
export const reviewsJsonPath = join(
	process.cwd(),
	'src/resources/reviews/reviews.json',
);

export const saveImages = (name, conntentAsBuffer) =>
	writeFile(join(publicFolderPathForImage, name), conntentAsBuffer);
console.log(mediaJsonPath);
console.log(reviewsJsonPath);
export const readMedia = () => readJSON(mediaJsonPath);
export const writeMedia = (content) => writeJSON(mediaJsonPath, content);
export const readReviews = () => readJSON(reviewsJsonPath);
export const writeReviews = (content) => writeJSON(reviewsJsonPath, content);
