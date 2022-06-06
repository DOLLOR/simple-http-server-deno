type ResponseDataType = ConstructorParameters<typeof Response>['0']

type CreateServerArgs = {
  port?: number;
  host?: string;
  onRequest: (args: Deno.RequestEvent) => Promise<ResponseDataType>;
};

const serveHttp = async function (
  conn: Deno.Conn,
  onRequest: CreateServerArgs['onRequest'],
) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const responseBody = await onRequest(requestEvent);
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    requestEvent.respondWith(
      new Response(responseBody, {
        status: 200,
        headers: {
          'Server': `My server DENO/${Deno.version.deno}`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Cache-Control': 'public, max-age=0',
          'Content-Type': 'text/plain; charset=UTF-8',
        }
      }),
    );
  }
}

const createServer = async (
  { port = 8722, host: hostname, onRequest }: CreateServerArgs,
) => {
  // Start listening on port of localhost.
  const server = Deno.listen({ port, hostname });
  console.log(
    `HTTP webserver running.  Access it at:  http://localhost:${port}/`,
  );

  // Connections to the server will be yielded up as an async iterable.
  for await (const conn of server) {
    // In order to not be blocking, we need to handle each connection individually
    // without awaiting the function
    serveHttp(conn, onRequest);
  }
};

// example
createServer({
  onRequest: async (requestEvent) => {
    console.log(
      requestEvent.request.url,
      await requestEvent.request.text(),
    );
    return 'ok';
  }
});
