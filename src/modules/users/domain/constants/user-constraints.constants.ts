/*Constants specific to user*/
export const USER_LIMITS = {
  FIRSTNAME:{
    MIN_LENGTH:1,
    MAX_LENGTH:128,
  },
  LASTNAME:{
    MIN_LENGTH:1,
    MAX_LENGTH:128
  },
  ADDRESS:{
    MAX_NUMBER_OF_ADDRESSES:10, // How many different addresses a user can have
    MIN_LENGTH: 1,
    MAX_LENGTH: 255
  },
  WISHLIST:{
    MAX_WISHLIST_ITEMS: 100,// How many different products a user can insert in it's wishlist
  } ,
  PASSWORD:{
    MIN_LENGTH:8,
    MAX_LENGTH:255
  }

} as const;
  // MAX_ADDRESSES: 10,
  // MAX_WISHLIST_ITEMS: 100,
  // MIN_AGE_YEARS: 13,