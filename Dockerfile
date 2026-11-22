# 2048 NEON — jeu statique ODG. Aucun build : fichiers servis par nginx sans root.
FROM nginxinc/nginx-unprivileged:1.30-alpine

# CVE corrigées par mise à jour des paquets de l'image de base 1.30-alpine :
# - brotli-libs 1.2.0-r1 (CVE-2026-111497, out-of-bounds write) -> 1.2.1-r0 ;
# - nginx 1.30.6-r1 (CVE-2026-113425, CVE-2026-121810, CVE-2026-123007, CVE-2026-123633 :
#   use-after-free et débordement de fenêtre en HTTP/2 et HTTP/3) -> 1.30.7-r0.
# L'image tourne par défaut en utilisateur non-root (101) : repasser root le temps d'apk.
USER root
RUN apk add --no-cache --upgrade brotli-libs nginx
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
