
export const PX_TO_PT_RATIO = 0.75292857;
export const PT_TO_PX_RATIO = 1 / PX_TO_PT_RATIO;

export function convertToCSSPTValue(styleValue: string): number {
  const matches = !isNaN(Number(styleValue)) ? [styleValue] : null;

  if (!matches) {
    return 0;
  }
  let value = parseFloat(matches[1]);
  const unit = matches[2];
  if (!value || !unit) {
    return 0;
  }
  if (unit === 'px') {
    value = PX_TO_PT_RATIO * value;
  }
  return value;
}
