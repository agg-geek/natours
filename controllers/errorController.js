const AppError = require('./../utils/appError');

const handleDBCastError = err => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleDBDuplicateError = err => {
	const message = `Duplicate field value: '${err.keyValue.name}'`;
	return new AppError(message, 400);
};

const handleDBValidationError = err => {
	const errors = Object.values(err.errors).map(err => err.message);
	const message = `Invalid input data. ${errors.join('. ')}.`;
	return new AppError(message, 400);
};

const sendDevError = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		stack: err.stack,
		error: err,
	});
};

const sendProdError = (err, res) => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		console.error(err);
		res.status(err.statusCode).json({
			status: '500',
			message: 'Something went wrong',
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendDevError(err, res);
	} else {
		if (err.name === 'CastError') err = handleDBCastError(err);
		if (err.code === 11000) err = handleDBDuplicateError(err);

		// if you updateTour with invalid data say:
		// { "name": "hello", "difficulty": "nothing" }
		// where name is too short (min 10 characters reqd) and difficulty is invalid
		// we get mongoose validation error (this is not a mongodb error)
		if (err.name === 'ValidationError') err = handleDBValidationError(err);
		sendProdError(err, res);
	}
};
