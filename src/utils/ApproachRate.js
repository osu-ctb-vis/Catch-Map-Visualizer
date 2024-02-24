export const calculatePreempt = (approachRate) => {
    if (approachRate == 5) return 1200;
    else if (approachRate < 5) return 1200 + 600 * (5 - approachRate) / 5;
    else return 1200 - 750 * (approachRate - 5) / 5;
}