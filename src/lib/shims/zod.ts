// Zod offline shim
/* eslint-disable @typescript-eslint/no-unused-vars */
export const z = {
  object: (shape: any) => ({
    shape,
    parse: (data: any) => data,
    safeParse: (data: any) => ({ success: true as const, data, error: undefined as any })
  }),
  string: () => ({
    min: (_limit?: number, _message?: string) => z.string(),
    email: (_message?: string) => z.string(),
    optional: () => z.string(),
    url: (_message?: string) => z.string()
  }),
  number: () => ({
    min: (_limit?: number, _message?: string) => z.number(),
    optional: () => z.number()
  }),
  boolean: () => ({
    optional: () => z.boolean()
  })
};

export type Infer<T> = T;
