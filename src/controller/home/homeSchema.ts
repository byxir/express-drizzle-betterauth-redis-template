import { z } from "zod";

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const HomeParameters = z.object({
  name: z.string().min(1)
});

export const HomeResponse = z.object({
  message: z.string().min(1)
});

export const HomeSchema = z.object({
  parameters: HomeParameters,
  response: HomeResponse
});
