export function CalculateScaleFromCircleSize(circleSize, applyFudge = false){
	const broken_gamefield_rounding_allowance = 1.00041;

	const DifficultyRange = (difficulty) => (difficulty - 5) / 5;

	return (1 - 0.7 * DifficultyRange(circleSize)) / 2 * (applyFudge ? broken_gamefield_rounding_allowance : 1);
}

export function calculateScale(difficulty) {
	return CalculateScaleFromCircleSize(difficulty.circleSize) * 2
}

const BASE_SIZE = 106.75;
export const ALLOWED_CATCH_RANGE = 0.8;

export function CalculateCatchWidthByScale(scale) {
	return BASE_SIZE * Math.abs(scale) * ALLOWED_CATCH_RANGE;
}

export function CalculateCatchWidth(difficulty) {
	return CalculateCatchWidthByScale(calculateScale(difficulty));
}

export function CalculateCatchWidthByCircleSize(circleSize) {
	return CalculateCatchWidthByScale(CalculateScaleFromCircleSize(circleSize));
}