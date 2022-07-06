// example
// deno run --no-check --allow-net app.ts
import * as httpServer from "./httpServer.ts";

httpServer.createServer({
  onRequest: async (requestEvent): Promise<httpServer.ResponseData> => {
    console.log(
      requestEvent.request.url,
      await requestEvent.request.text(),
    );
    return {
      body: "ok",
    };
  },
});
