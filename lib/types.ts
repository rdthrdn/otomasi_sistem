export type AccessResult = "ACCESS GRANTED" | "ACCESS DENIED";

export type LockerStatus = {
  id: string;
  owner_uid: string | null;
  occupied: boolean;
  current_weight: number | null;
  updated_at: string;
};

export type AccessLog = {
  id: string;
  locker_id: string | null;
  uid: string;
  result: AccessResult | string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      locker_status: {
        Row: LockerStatus;
        Insert: Partial<LockerStatus> & Pick<LockerStatus, "occupied">;
        Update: Partial<LockerStatus>;
      };
      access_logs: {
        Row: AccessLog;
        Insert: Omit<AccessLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AccessLog>;
      };
    };
  };
};
