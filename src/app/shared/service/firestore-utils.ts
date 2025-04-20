/**
 * Converts a class instance to a plain JavaScript object.
 * Firestore requires plain objects for serialization, not class instances.
 * @param instance The class instance to convert.
 * @returns A plain object safe for Firestore.
 */
export function serializeForFirestore<T>(instance: T): any {
    return Object.assign({}, instance);
  }
  