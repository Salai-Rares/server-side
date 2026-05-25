// Define which operators make sense for each condition type
export const CONDITION_TYPE_OPERATORS = {
  product: ['equals', 'in'] as const,
  // Logic: A product either IS a specific product (equals) or IS ONE OF several products (in)
  // greater_than/less_than don't make sense for product IDs
  variant:  ['equals', 'in'] as const,
  category: ['equals', 'in'] as const,  
  // Logic: Same as products - category either IS one or IS ONE OF several
  
  tag: ['equals', 'in'] as const,
  // Logic: Product either HAS a tag (equals) or HAS ONE OF several tags (in)
  
  cart_total: ['greater_than', 'less_than'] as const,
  // Logic: Cart totals are numbers - you compare with > or 
  // 'equals' could work but usually you want "spend over X" not "spend exactly X"
  
  quantity: ['equals', 'greater_than', 'less_than'] as const,
  // Logic: Quantity comparisons - exactly 3 items, more than 2, less than 10, etc.
  
  user_segment: ['equals', 'in'] as const,
  // Logic: User either IS a segment (equals) or IS ONE OF several segments (in)
} as const;


// Define expected value types for each condition type  
export const CONDITION_VALUE_TYPES = {
  product: 'string', // Product IDs are strings
  variant:'string',
  category: 'string', // Category names are strings  
  tag: 'string', // Tag names are strings
  cart_total: 'number', // Dollar amounts are numbers
  quantity: 'number', // Item counts are numbers
  user_segment: 'string', // Segment names are strings
} as const;

// Operators that require array values instead of single values
export const OPERATORS_ACCEPTING_ARRAYS = ['in'] as const;

// Utility functions
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