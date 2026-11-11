# 2048 NEON · OhDjiGames

Le puzzle 2048 aux couleurs du game center [ohdji.dev](https://ohdji.dev/) : glisse, fusionne les tuiles, atteins 2048.
100 % statique (HTML, CSS, JS sans dépendance ni build), polices auto-hébergées, aucun appel à un service tiers.

```
public/
  index.html   page + liens de retour vers ohdji.dev
  style.css    direction artistique du hub (fond spatial, Press Start 2P, jaune/cyan)
  logic.js     règles du jeu, sans DOM
  game.js      affichage, clavier, glissement tactile, sauvegarde (localStorage)
tests/         tests des règles (node --test)
nginx.conf     en-têtes de sécurité (CSP stricte), cache, /healthz
Dockerfile     nginx-unprivileged, port 8080
```

## Développer
```bash
npm test                                      # règles du jeu
cd public && python3 -m http.server 8000      # http://localhost:8000
docker build -t game-2048 . && docker run --rm -p 8080:8080 game-2048
```

Commandes : flèches ou ZQSD / WASD, glissement sur mobile. La partie en cours et le record sont gardés dans le navigateur.

## Déploiement Dokploy
Application, build Dockerfile, port 8080, HTTPS Let's Encrypt.
Ensuite, dans le hub : ajouter le `<a class="slot slot-on">` dans `index.html` et retirer son angle de `LOCKED_ANGLES` dans `hub.js`.
