export const bookingRefRegex = /^D\s?\d{3}\s?\d{3}\s?\d{2}[ABCDEFGHJKLMNPQRTUVWXYZ\d]$/;

export const formatBookingReference = (ref: string): string =>
  ref.replace(
    /^D\s?(\d{3})\s?(\d{3})\s?(\d{2}[ABCDEFGHJKLMNPQRTUVWXYZ\d])$/,
    'D $1 $2 $3',
  );

export const isBookingReference = (ref: string): boolean => bookingRefRegex.test(ref);

