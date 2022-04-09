export type ValueOf<T> = T[keyof T];

export type NoNullFields<O> = { [K in keyof O]: NonNullable<O[K]> };

export type NullableFields<O, D extends keyof O> = { [K in keyof O]: K extends D ? O[K] | null : O[K] };

export type RequiredPartial<O, T extends keyof O> = Partial<O> & Required<Pick<O, T>>;

// Analogues to array.prototype.shift
type Shift<T extends unknown[]> = ((...t: T) => unknown) extends (first: unknown, ...rest: infer Rest) => unknown
  ? Rest
  : never;

// use a distributed conditional type here
type ShiftUnion<T> = T extends unknown[] ? Shift<T> : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type DeepRequired<T, P extends string[]> = T extends object
  ? Omit<T, Extract<keyof T, P[0]>> &
      Required<
        {
          [K in Extract<keyof T, P[0]>]: NonNullable<DeepRequired<T[K], ShiftUnion<P>>>;
        }
      >
  : T;

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithNull<T> = { [K in keyof T]: T[K] | null };
