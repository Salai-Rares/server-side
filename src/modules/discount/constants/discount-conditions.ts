export const CONDITION_TYPE_OPERATORS = {
  product:      ["equals"] as const,
  variant:      ["equals"] as const,
  category:     ["equals"] as const,
  tag:          ["equals"] as const,
  cart_total:   ["greater_than", "less_than"] as const,
  quantity:     ["equals", "greater_than", "less_than"] as const,
  user_segment: ["equals"] as const,
} as const;

export const CONDITION_VALUE_TYPES = {
  product:      "string",
  variant:      "string",
  category:     "string",
  tag:          "string",
  cart_total:   "number",
  quantity:     "number",
  user_segment: "string",
} as const;

export const isValidTypeOperatorCombination = (
  type: keyof typeof CONDITION_TYPE_OPERATORS,
  operator: string
): boolean => {
  return (CONDITION_TYPE_OPERATORS[type] as readonly string[]).includes(operator);
};

export const getValidOperators = (type: keyof typeof CONDITION_TYPE_OPERATORS) => {
  return CONDITION_TYPE_OPERATORS[type];
};

export const getExpectedValueType = (type: keyof typeof CONDITION_VALUE_TYPES) => {
  return CONDITION_VALUE_TYPES[type];
};
