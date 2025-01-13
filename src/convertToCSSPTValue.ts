export const PX_TO_PT_RATIO = 0.75292857;
export const PT_TO_PX_RATIO = 1 / PX_TO_PT_RATIO;

export function convertToCSSPTValue(styleValue: string): number {
  if (!styleValue || typeof styleValue !== 'string') {
    return 0;
  }

  // Trim the input string
  styleValue = styleValue.trim();

  // Find the first non-numeric character
  let index = 0;
  while (
    index < styleValue.length &&
    ((styleValue[index] >= '0' && styleValue[index] <= '9') ||
      styleValue[index] === '.' ||
      styleValue[index] === '-')
  ) {
    index++;
  }

  const valuePart = styleValue.slice(0, index);
  const unitPart = styleValue.slice(index);

  const value = parseFloat(valuePart);

  // Check if the value is a valid number and the unit is 'px'
  if (isNaN(value) || unitPart !== 'px') {
    return 0;
  }

  return PX_TO_PT_RATIO * value;
}
