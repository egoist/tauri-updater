export function notFound(): Response {
  return new Response("Not found", { status: 404 })
}
export function noUpdateAvailable(): Response {
  return new Response(null, {
    status: 204,
  })
}

export function json(obj: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(obj), {
    status: init?.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  })
}
