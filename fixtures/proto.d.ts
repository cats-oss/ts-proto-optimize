import * as $protobuf from "protobufjs";

/** Namespace root. */
export namespace root {
  /** Namespace api. */
  namespace api {
    /** Properties of a Foo */
    interface IFoo {
      /** Foo str */
      str?: string | null;

      /** Foo bool */
      bool?: boolean | null;

      /** Foo number */
      num?: number | Long | null;

      /** Foo metadata */
      metadata?: { [k: string]: string } | null;
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
      public bool: boolean;

      /** comment */
      public num: number;

      /** comment */
      public metadata: { [k: string]: string };

      /** comment */
      public static method(): void;
    }

    /** Enum enum */
    enum Enum {
      KEY1_SNAKE_CASE = 0,
      KEY2_SNAKE_CASE = 1,
      KEY3_SNAKE_CASE = 2
    }

    /** Properties of a Enumerate */
    interface IEnumerate {
      /** Enumerate id */
      id?: string | null;

      /** Enumrate field */
      field?: root.api.Enum | null;

      /** Enumrate arr */
      arr?: root.api.Enum[] | null;
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
