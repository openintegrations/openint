export function GET() {
  return new Response(
    `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>Elements Dev Portal</title>
  
      <script src="https://unpkg.com/@stoplight/elements-dev-portal/web-components.min.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements-dev-portal/styles.min.css">
    </head>
    <body>

      <elements-stoplight-project
        projectId="cHJqOjI2NTQzOA"
        router="hash"
        apiDescriptionUrl="/api/v0/openapi.json"
        layout="sidebar"
      ></elements-stoplight-project>

    </body>
  </html>
    `,
    {headers: {'Content-Type': 'text/html'}},
  )
}
