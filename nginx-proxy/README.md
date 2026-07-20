# nginx-proxy (placeholder)

This directory is reserved for the Nginx reverse proxy configuration that will be
added in the **final deployment phase**.

It will handle:
- SSL/TLS termination (Let's Encrypt via certbot or pre-provisioned certs)
- Routing: `/` → frontend container, `/api/*` → backend container (replacing
  the in-container nginx.conf proxy used in Phase 0)
- HTTP → HTTPS redirect
- Security headers (HSTS, X-Frame-Options, etc.)

Do not add config files here until the deployment phase prompt is executed.
