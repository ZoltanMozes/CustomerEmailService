/**
 * Customer Event
 */

type CustomerEvent = {
  name: string;
  details?: any;
};

/**
 * Rendered customer email
 */
type CustomerEmail = {body: string; to: string};
