// netlify/functions/wompi-proxy.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const response = await fetch(
      'https://adkqijensfxzzftylktm.supabase.co/functions/v1/wompi-webhook',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka3FpamVuc2Z4enpmdHlsa3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzQ1OTMsImV4cCI6MjA5Mzc1MDU5M30.Yk7hafWIWMsKQtcCZ4f03_hCVtAUgoTt4soxEgEuLrY',
        },
        body: event.body,
      }
    )

    const text = await response.text()
    console.log('Wompi proxy response:', response.status, text)

    return {
      statusCode: response.ok ? 200 : response.status,
      body: text,
    }
  } catch (err) {
    console.error('Wompi proxy error:', err)
    return { statusCode: 500, body: 'Internal error' }
  }
}