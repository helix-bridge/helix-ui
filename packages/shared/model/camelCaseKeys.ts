/* eslint-disable @typescript-eslint/no-explicit-any */
import type camelcaseKeys from 'camelcase-keys';

type WordSeparators = '-' | '_' | ' ';

type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S];

type InnerCamelCaseStringArray<Parts extends any[], PreviousPart> = Parts extends [
  `${infer FirstPart}`,
  ...infer RemainingParts
]
  ? FirstPart extends undefined
    ? ''
    : FirstPart extends ''
    ? InnerCamelCaseStringArray<RemainingParts, PreviousPart>
    : `${PreviousPart extends '' ? FirstPart : Capitalize<FirstPart>}${InnerCamelCaseStringArray<
        RemainingParts,
        FirstPart
      >}`
  : '';

type CamelCaseStringArray<Parts extends string[]> = Parts extends [`${infer FirstPart}`, ...infer RemainingParts]
  ? Uncapitalize<`${FirstPart}${InnerCamelCaseStringArray<RemainingParts, FirstPart>}`>
  : never;

type CamelCase<K> = K extends string
  ? K extends Uppercase<K>
    ? CamelCaseStringArray<Split<Lowercase<K>, WordSeparators>>
    : CamelCaseStringArray<Split<K, WordSeparators>>
  : K;

type PascalCase<Value> = CamelCase<Value> extends string ? Capitalize<CamelCase<Value>> : CamelCase<Value>;

type EmptyTuple = [];

type IsInclude<List extends readonly unknown[], Target> = List extends undefined
  ? false
  : List extends Readonly<EmptyTuple>
  ? false
  : List extends readonly [infer First, ...infer Rest]
  ? First extends Target
    ? true
    : IsInclude<Rest, Target>
  : boolean;

type AppendPath<S extends string, Last extends string> = S extends '' ? Last : `${S}.${Last}`;

type CamelCaseKeys<
  T extends Record<string, any> | readonly any[],
  Deep extends boolean,
  IsPascalCase extends boolean,
  Exclude extends readonly unknown[],
  StopPaths extends readonly string[],
  Path extends string = ''
> = T extends readonly any[]
  ? // Handle arrays or tuples.
    {
      [P in keyof T]: CamelCaseKeys<T[P], Deep, IsPascalCase, Exclude, StopPaths>;
    }
  : T extends Record<string, any>
  ? // Handle objects.
    {
      [P in keyof T & string as [IsInclude<Exclude, P>] extends [true]
        ? P
        : [IsPascalCase] extends [true]
        ? PascalCase<P>
        : CamelCase<P>]: [IsInclude<StopPaths, AppendPath<Path, P>>] extends [true]
        ? T[P]
        : [Deep] extends [true]
        ? CamelCaseKeys<T[P], Deep, IsPascalCase, Exclude, StopPaths, AppendPath<Path, P>>
        : T[P];
    }
  : T;

type WithDefault<T, U extends T> = T extends undefined | void | null ? U : T;

export type ICamelCaseKeys<T> = CamelCaseKeys<
  T,
  WithDefault<camelcaseKeys.Options['deep'], false>,
  WithDefault<camelcaseKeys.Options['pascalCase'], false>,
  WithDefault<camelcaseKeys.Options['exclude'], EmptyTuple>,
  WithDefault<camelcaseKeys.Options['stopPaths'], EmptyTuple>
>;
