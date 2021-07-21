# `@cats-oss/ts-proto-optimize`

[![Continuous Integration](https://github.com/cats-oss/ts-proto-optimize/actions/workflows/ci.yml/badge.svg)](https://github.com/cats-oss/ts-proto-optimize/actions/workflows/ci.yml)

> **[EXPERIMENTAL]** It's CLI tool for optimize TypeScript protobuf type-definition file.

Optimize the definition of a protobuf that is only used to get type-safe. Compilation using Babel becomes possible.

## Features

- Extract all `enum`.
  - Remove from namespace and concat names. (use pascal case)
  - Replaces `interface` with `enum`.
- Remove `import * as $protobuf from "protobufjs";`.
  - Keep the small bundle size.
- Remove all `Long`, Nullable, and Optional.
- Remove all `class`.
- Add `export` keyword to `interface` in `namespace`.

## Installation

```bash
$ npm i -D @cats-oss/ts-proto-optimize
```

## Usage

```bash
# Output to stdout
$ $(npm bin)/ts-proto-optimize path/to/proto.d.ts

# Output to file
$ $(npm bin)/ts-proto-optimize path/to/proto.d.ts --output dist/to/proto.ts
```

### Example

**input:**

```typescript
import * as $protobuf from "protobufjs";

/** Namespace root. */
export namespace root {
  /** Namespace api. */
  namespace api {
    /** Properties of a Foo */
    interface IFoo {
      /** Foo str */
      str?: string | null;

      /** Foo number */
      num?: number | Long | null;
    }

    /** class Enumerate */
    class Foo implements IFoo {
      /**
       * comment
       */
      constructor(properties?: root.api.IFoo);

      /** comment */
      public str: string;

      /** comment */
      public num: number;
    }

    /** Enum enum */
    enum Enum {
      KEY1_SNAKE_CASE = 0,
      KEY2_SNAKE_CASE = 1,
      KEY3_SNAKE_CASE = 2
    }

    namespace Nest {
      /** Enum enum. */
      enum Enum {
        KEY1 = 0,
        KEY2 = 1,
        KEY3 = 2
      }

      /** Properties Data */
      interface IData {
        name?: string | null;
        value?: number | null;
        field?: root.api.Nest.IData | null;
        enumratee?: root.api.Nest.Enum | null;
      }

      /** Represents Data */
      class Data implements IData {
        constructor(properties?: root.api.Nest.IData);
      }
    }
  }
}
```

**output:**

```typescript
/** Namespace root. */
export declare namespace root {
    /** Namespace api. */
    export namespace api {
        /** Properties of a Foo */
        export interface IFoo {
            /** Foo str */
            str: (string);
            /** Foo number */
            num: (number);
        }
        export namespace Nest {
            /** Properties Data */
            export interface IData {
                name: (string);
                value: (number);
                field: (root.api.Nest.IData);
                enumratee: (RootApiNestEnum);
            }
        }
    }
}
export enum RootApiEnum {
    KEY1_SNAKE_CASE = 0,
    KEY2_SNAKE_CASE = 1,
    KEY3_SNAKE_CASE = 2
}
export enum RootApiNestEnum {
    KEY1 = 0,
    KEY2 = 1,
    KEY3 = 2
}
```

## License

[MIT © Cyberagent, Inc](./LICENSE)
