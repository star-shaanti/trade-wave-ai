# Guide : Ajouter votre Logo et Favicon

## 📁 Où placer vos fichiers

Placez vos fichiers image dans le dossier `public/` :

```
public/
  ├── logo.png (ou logo.svg)
  ├── favicon.svg (ou favicon.ico, favicon.png)
  ├── logo-512.png (pour PWA)
  └── logo-192.png (pour PWA)
```

## 🎨 Formats supportés

- **SVG** (recommandé) : Meilleure qualité, s'adapte à toutes les tailles
- **PNG** : Bon pour les logos complexes
- **ICO** : Pour les favicons classiques

## 📝 Étapes

1. **Copiez vos fichiers** dans `public/`
   - Exemple : `public/logo.svg` et `public/favicon.svg`

2. **Le code utilisera automatiquement** ces fichiers :
   - Logo : dans `src/components/Logo.tsx`
   - Favicon : dans `index.html`

## ✅ C'est tout !

Après avoir ajouté les fichiers, ils seront automatiquement utilisés après le prochain build.
