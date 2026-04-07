export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Pretty URLs for all content pages.
    if (request.method === 'GET' && !url.pathname.includes('.') && !url.pathname.endsWith('/')) {
      url.pathname = `${url.pathname}.html`;
      return Response.redirect(url.toString(), 301);
    }

    if (request.method === 'GET' && url.pathname.endsWith('/')) {
      url.pathname = `${url.pathname}index.html`;
      return Response.redirect(url.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);

    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    headers.set('X-Frame-Options', 'SAMEORIGIN');

    if (url.pathname.endsWith('.html') || url.pathname === '/') {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
