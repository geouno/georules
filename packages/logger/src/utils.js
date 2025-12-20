const HUE_RANGE_LB = 120; // Green
const HUE_RANGE_UB = 240; // Blue

let lastHue = -1;
let currentBgColor = null;

// Helper to convert HSL to RGB
function hslToRgb(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return [f(0), f(8), f(4)];
}

export const RandomBackground = {
  latest() {
    if (!currentBgColor) return this.generate();
    return currentBgColor;
  },

  generate() {
    const minDifference = 20; // For "considerably different" hues
    let hue;

    let lastHueLeftGap = lastHue === -1
      ? 0
      : Math.min(lastHue - HUE_RANGE_LB, minDifference);
    let lastHueRightGap = lastHue === -1
      ? 0
      : Math.min(HUE_RANGE_UB - lastHue, minDifference);

    // Find new hue by randomly choosing a point in our range exluding the last hue and its gaps.
    let rand = Math.floor(
      Math.random() *
        (HUE_RANGE_UB - HUE_RANGE_LB - lastHueLeftGap - lastHueRightGap),
    ) + HUE_RANGE_LB;
    if (rand < lastHue - minDifference) {
      hue = rand;
    } else {
      hue = rand + lastHueLeftGap + lastHueRightGap;
    }

    lastHue = hue;

    // Semi-transparent look:
    // Low lightness to create a subtle dark tint (looks like transparency on dark terminals)
    // TODO: Implement transparency effect for every terminal, based on its background color.
    // Saturation: 60% (Vibrant but not neon)
    // Lightness: 8.25%
    const [r, g, b] = hslToRgb(hue, 60, 8.25);

    currentBgColor = [r, g, b];
    return currentBgColor;
  },
};
