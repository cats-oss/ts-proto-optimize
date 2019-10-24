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

    class AdminService extends $protobuf.rpc.Service {

      /**
       * Constructs a new AdminService service.
       * @param rpcImpl RPC implementation
       * @param [requestDelimited=false] Whether requests are length-delimited
       * @param [responseDelimited=false] Whether responses are length-delimited
       */
      constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

      /**
       * Calls ListOperationConfig.
       * @param request ListOperationConfigRequest message or plain object
       * @param callback Node-style callback called with the error, if any, and ListOperationConfigResponse
       */
      public listOperationConfig(request: love.api.v1.IListOperationConfigRequest, callback: love.api.v1.AdminService.ListOperationConfigCallback): void;

      /**
       * Calls ListOperationConfig.
       * @param request ListOperationConfigRequest message or plain object
       * @returns Promise
       */
      public listOperationConfig(request: love.api.v1.IListOperationConfigRequest): Promise<love.api.v1.ListOperationConfigResponse>;

      /**
       * Calls ListAnnouncement.
       * @param request ListAnnouncementRequest message or plain object
       * @param callback Node-style callback called with the error, if any, and ListAnnouncementResponse
       */
      public listAnnouncement(request: love.api.v1.IListAnnouncementRequest, callback: love.api.v1.AdminService.ListAnnouncementCallback): void;

      /**
       * Calls ListAnnouncement.
       * @param request ListAnnouncementRequest message or plain object
       * @returns Promise
       */
      public listAnnouncement(request: love.api.v1.IListAnnouncementRequest): Promise<love.api.v1.ListAnnouncementResponse>;

      /**
       * Calls GetAnnouncement.
       * @param request GetAnnouncementRequest message or plain object
       * @param callback Node-style callback called with the error, if any, and GetAnnouncementResponse
       */
      public getAnnouncement(request: love.api.v1.IGetAnnouncementRequest, callback: love.api.v1.AdminService.GetAnnouncementCallback): void;

      /**
       * Calls GetAnnouncement.
       * @param request GetAnnouncementRequest message or plain object
       * @returns Promise
       */
      public getAnnouncement(request: love.api.v1.IGetAnnouncementRequest): Promise<love.api.v1.GetAnnouncementResponse>;
  }

  namespace AdminService {

      /**
       * Callback as used by {@link love.api.v1.AdminService#listOperationConfig}.
       * @param error Error, if any
       * @param [response] ListOperationConfigResponse
       */
      type ListOperationConfigCallback = (error: (Error|null), response?: love.api.v1.ListOperationConfigResponse) => void;

      /**
       * Callback as used by {@link love.api.v1.AdminService#listAnnouncement}.
       * @param error Error, if any
       * @param [response] ListAnnouncementResponse
       */
      type ListAnnouncementCallback = (error: (Error|null), response?: love.api.v1.ListAnnouncementResponse) => void;

      /**
       * Callback as used by {@link love.api.v1.AdminService#getAnnouncement}.
       * @param error Error, if any
       * @param [response] GetAnnouncementResponse
       */
      type GetAnnouncementCallback = (error: (Error|null), response?: love.api.v1.GetAnnouncementResponse) => void;
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

/** Namespace depth1. */
export namespace depth1 {
  namespace depth2 {
    namespace depth3 {
      interface IFoo {
        /** Foo key */
        key?: string | null;
      }
    }
  }
}
