export type ConditionScope = "cart" | "matched_items";

export const CONDITION_SCOPES = ["cart", "matched_items"] as const;

export const DEFAULT_CONDITION_SCOPE: ConditionScope = "cart";

// Conditions that select individual cart items. They narrow the matched set
// rather than being evaluated against an aggregate.
export const ITEM_CONDITION_TYPES = new Set([
  "product", "variant", "category", "tag",
]);

export const CONDITION_TYPE_OPERATORS = {
  product:      ["equals"] as const,
  variant:      ["equals"] as const,
  category:     ["equals"] as const,
  tag:          ["equals"] as const,
  subtotal:     ["at_least", "at_most", "greater_than", "less_than"] as const,
  quantity:     ["equals", "at_least", "at_most", "greater_than", "less_than"] as const,
  user_segment: ["equals"] as const,
} as const;

export const CONDITION_VALUE_TYPES = {
  product:      "string",
  variant:      "string",
  category:     "string",
  tag:          "string",
  subtotal:     "number",
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
