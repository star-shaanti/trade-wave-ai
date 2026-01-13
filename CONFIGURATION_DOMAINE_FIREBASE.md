# Configuration du Domaine Personnalisé sur Firebase Hosting

## Problème actuel

Le domaine `realtimetradingsignals.com` affiche la page "Site Not Found" de Firebase car le domaine n'est pas configuré dans Firebase Hosting.

## Solution : Configurer le domaine personnalisé

### Étape 1 : Ajouter le domaine dans Firebase Console

1. **Allez sur la Console Firebase** :
   - Ouvrez : https://console.firebase.google.com/project/realtime-dc5d3/hosting
   
2. **Cliquez sur "Ajouter un domaine personnalisé"** (ou "Add custom domain")

3. **Entrez votre domaine** :
   - Tapez : `realtimetradingsignals.com`
   - Cliquez sur "Continuer" ou "Continue"

4. **Firebase vous donnera des enregistrements DNS** à configurer :
   - Il vous demandera de choisir entre deux types de configuration :
     - **Type A** : Enregistrements A avec des adresses IP
     - **Type CNAME** : Enregistrement CNAME (plus simple, recommandé)

### Étape 2 : Configurer les enregistrements DNS

Firebase vous fournira les enregistrements exacts à ajouter. Généralement :

#### Option A : Configuration avec CNAME (Recommandé)

Dans votre panneau DNS (OVH, Cloudflare, etc.), ajoutez :

```
Type: CNAME
Nom: @ (ou vide, ou realtimetradingsignals.com)
Valeur: realtime-dc5d3.web.app
TTL: 3600 (ou automatique)
```

Pour le sous-domaine www (optionnel mais recommandé) :
```
Type: CNAME
Nom: www
Valeur: realtime-dc5d3.web.app
TTL: 3600
```

#### Option B : Configuration avec enregistrements A

Si Firebase vous donne des adresses IP (généralement 2 IPs), ajoutez :

```
Type: A
Nom: @ (ou vide)
Valeur: [IP1 fournie par Firebase]
TTL: 3600

Type: A
Nom: @ (ou vide)
Valeur: [IP2 fournie par Firebase]
TTL: 3600
```

### Étape 3 : Vérifier la configuration DNS

Une fois les enregistrements DNS ajoutés :

1. **Dans Firebase Console**, cliquez sur "Vérifier" ou "Verify"
2. Firebase vérifiera automatiquement que les enregistrements DNS sont corrects
3. Cette vérification peut prendre quelques minutes

### Étape 4 : Attendre la propagation DNS

- La propagation DNS peut prendre de quelques minutes à 48 heures
- Généralement, c'est opérationnel en 15-30 minutes

### Étape 5 : Vérifier que le site fonctionne

Une fois la configuration terminée et la propagation DNS effectuée :

1. Visitez : https://realtimetradingsignals.com
2. Vous devriez voir votre site au lieu de la page "Site Not Found"
3. Vérifiez aussi : https://realtimetradingsignals.com/sitemap.xml

## Configuration actuelle DNS (à vérifier)

D'après les tests, votre domaine pointe actuellement vers :
- IP : `66.115.166.238` (ce n'est pas une IP Firebase)

Vous devez modifier ces enregistrements pour pointer vers Firebase.

## Instructions spécifiques selon votre registrar

### Si vous utilisez OVH :

1. Connectez-vous à votre espace client OVH
2. Allez dans "Domaines" > "realtimetradingsignals.com"
3. Cliquez sur "Zone DNS"
4. Supprimez ou modifiez les enregistrements A existants
5. Ajoutez les nouveaux enregistrements fournis par Firebase (CNAME recommandé)
6. Attendez la propagation (15-30 minutes généralement)

### Si vous utilisez Cloudflare :

1. Connectez-vous à Cloudflare
2. Sélectionnez le domaine `realtimetradingsignals.com`
3. Allez dans "DNS" > "Records"
4. Modifiez les enregistrements existants ou ajoutez les nouveaux
5. Désactivez le proxy orange (Cloudflare) pour le domaine (ou laissez-le activé, Firebase fonctionne avec)
6. Attendez la propagation

## Vérification après configuration

Une fois configuré, vous pouvez vérifier avec :

```bash
# Vérifier les enregistrements DNS
nslookup realtimetradingsignals.com

# Vérifier que le site fonctionne
curl -I https://realtimetradingsignals.com
```

## Important

- ✅ Votre site est déjà déployé sur Firebase : https://realtime-dc5d3.web.app
- ✅ Le domaine personnalisé doit être ajouté dans Firebase Console
- ✅ Les enregistrements DNS doivent pointer vers Firebase
- ⏳ La propagation DNS peut prendre du temps

## Support

Si vous avez des difficultés :
- Consultez la documentation Firebase : https://firebase.google.com/docs/hosting/custom-domain
- Contactez le support de votre registrar DNS (OVH, Cloudflare, etc.)
