import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: '*',
    allowMethods: ['GET', 'OPTIONS'],
    maxAge: 600,
  })
)

// Proxy handler
app.all('*', async (c) => {
  const targetUrl = c.req.query('url')
  if (!targetUrl) {
    return c.text('Missing target URL', 400)
  }

  try {
    const url = new URL(targetUrl)
    const targetRequest = new Request(url, {
      method: c.req.method,
      headers: c.req.headers,
      body: ['GET', 'HEAD'].includes(c.req.method) ? null : c.req.body,
    })

    const response = await fetch(targetRequest)

    // Modify response headers
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Methods', '*')
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type')

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    })
  } catch (err) {
    return c.text(`Proxy Error: ${err.message}`, 500)
  }
})

// Export for Cloudflare Pages Functions
export const onRequest = app.fetch
