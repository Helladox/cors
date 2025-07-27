export async function onRequest(context) {
  const { request } = context
  const urlParam = new URL(request.url).searchParams.get("url")

  if (!urlParam) {
    return new Response("Missing target URL", { status: 400 })
  }

  try {
    const targetResponse = await fetch(urlParam, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
    })

    const headers = new Headers(targetResponse.headers)
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "*")
    headers.set("Access-Control-Allow-Headers", "*")

    return new Response(targetResponse.body, {
      status: targetResponse.status,
      headers,
    })
  } catch (err) {
    return new Response("Error fetching target URL: " + err.message, { status: 500 })
  }
}
