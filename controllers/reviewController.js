const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

module.exports.getAllReviews = catchAsync(async (req, res, next) => {
	const reviews = await Review.find();

	res.status(200).json({
		status: 'success',
		results: reviews.length,
		data: { reviews },
	});
});

module.exports.getReview = catchAsync(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	res.status(200).json({
		status: 'success',
		review,
	});
});

module.exports.createReview = catchAsync(async (req, res, next) => {
	// Nested routes

	// this fn is a POST request controller
	// we either get the data from POST body (if we have specified it)
	// or we get it based on the current tour and logged in user
	if (!req.body.tourId) req.body.tourId = req.params.tourId;
	if (!req.body.userId) req.body.userId = req.user.id;

	const newReview = await Review.create(req.body);

	res.status(201).json({
		status: 'success',
		data: { review: newReview },
	});
});