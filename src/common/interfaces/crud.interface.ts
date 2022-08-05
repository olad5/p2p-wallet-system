export interface CRUD<M, C, U> {
  list: (limit: number) => Promise<M[]>;
  create: (resource: C) => Promise<string | M>;
  readById: (id: string) => Promise<M | null>;
  patchById: (id: string, resource: U) => Promise<M | null>;
  deleteById?: (id: string) => Promise<M | null>;
}
