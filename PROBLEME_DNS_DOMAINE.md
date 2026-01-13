# Problème : Le domaine pointe vers l'ancien serveur

## Diagnostic

❌ **Le domaine `realtimetradingsignals.com` pointe toujours vers l'ancien serveur** :
- IP actuelle : `66.115.166.238` (ancien serveur Apache)
- Serveur détecté : `Apache` (pas Firebase)
- Le certificat SSL est en cours de génération dans Firebase

## Cause

Même si vous avez ajouté le domaine dans Firebase Console, **les enregistrements DNS n'ont pas encore été modifiés** pour pointer vers Firebase. Le domaine pointe toujours vers votre ancien hébergeur (probablement Hostinger ou un autre serveur Apache).

## Solution : Modifier les enregistrements DNS

### Étape 1 : Obtenir les enregistrements DNS depuis Firebase

1. Allez sur : https://console.firebase.google.com/project/realtime-dc5d3/hosting
2. Cliquez sur le domaine `realtimetradingsignals.com`
3. Firebase vous montrera les **enregistrements DNS à configurer**

Généralement, Firebase vous donne deux options :

#### Option A : CNAME (Recommandé - Plus simple)

```
Type: CNAME
Nom: @ (ou vide)
Valeur: realtime-dc5d3.web.app
TTL: 3600 (ou automatique)
```

**Note** : Certains registrars (comme OVH) ne permettent pas de CNAME sur la racine (@). Dans ce cas, utilisez l'Option B.

#### Option B : Enregistrements A (Adresses IP)

Firebase vous donnera généralement 2 adresses IP, par exemple :
```
Type: A
Nom: @ (ou vide)
Valeur: 151.101.1.195
TTL: 3600

Type: A
Nom: @ (ou vide)
Valeur: 151.101.65.195
TTL: 3600
```

### Étape 2 : Modifier les DNS dans votre registrar

**Important** : Vous devez aller dans votre panneau DNS (OVH, Hostinger, Cloudflare, etc.) et **remplacer les enregistrements existants**.

#### Si vous utilisez OVH :

1. Connectez-vous à : https://www.ovh.com/manager/
2. Allez dans "Domaines" > "realtimetradingsignals.com"
3. Cliquez sur "Zone DNS"
4. **Supprimez ou modifiez** l'enregistrement A existant qui pointe vers `66.115.166.238`
5. **Ajoutez les nouveaux enregistrements** fournis par Firebase (CNAME ou A)
6. Sauvegardez

#### Si vous utilisez Hostinger :

1. Connectez-vous à votre espace client Hostinger
2. Allez dans "Domaines" > "realtimetradingsignals.com"
3. Cliquez sur "Gérer" > "Zone DNS"
4. **Supprimez ou modifiez** l'enregistrement A existant (`66.115.166.238`)
5. **Ajoutez les nouveaux enregistrements** fournis par Firebase
6. Sauvegardez

#### Si vous utilisez Cloudflare :

1. Connectez-vous à Cloudflare
2. Sélectionnez le domaine `realtimetradingsignals.com`
3. Allez dans "DNS" > "Records"
4. **Modifiez** l'enregistrement A existant ou **supprimez-le et créez-en un nouveau**
5. Ajoutez les enregistrements fournis par Firebase
6. Si vous utilisez le proxy orange de Cloudflare, vous pouvez le laisser activé ou le désactiver (Firebase fonctionne dans les deux cas)

### Étape 3 : Attendre la propagation DNS

- ⏳ La propagation DNS prend généralement **15 minutes à 2 heures**
- Parfois jusqu'à 48 heures (rare)
- Vous pouvez vérifier la propagation avec : https://www.whatsmydns.net/#A/realtimetradingsignals.com

### Étape 4 : Vérifier dans Firebase

Une fois les DNS modifiés :

1. Revenez dans Firebase Console (https://console.firebase.google.com/project/realtime-dc5d3/hosting)
2. Firebase vérifiera automatiquement que les enregistrements DNS sont corrects
3. Le statut passera de "Génération du certificat" à "Connecté" ou "Actif"

### Étape 5 : Vérifier que le site fonctionne

Une fois la propagation terminée :

1. Visitez : https://realtimetradingsignals.com
2. Vous devriez voir votre site Firebase au lieu de la page Apache
3. Vérifiez aussi : https://realtimetradingsignals.com/sitemap.xml

## Vérifications

Vous pouvez vérifier que les DNS pointent vers Firebase avec :

```powershell
# Vérifier l'IP du domaine
nslookup realtimetradingsignals.com

# Si les DNS sont corrects, vous devriez voir une IP Firebase (151.101.x.x)
# ou un CNAME vers realtime-dc5d3.web.app
```

## Résumé

✅ Domaine ajouté dans Firebase Console
✅ Certificat SSL en cours de génération
❌ **Enregistrements DNS pas encore modifiés** ← **C'EST LE PROBLÈME**
⏳ Attendre la propagation DNS après modification

## Important

- Vous devez **modifier les enregistrements DNS** dans votre registrar
- Ne supprimez pas le domaine de Firebase, modifiez seulement les DNS
- Le certificat SSL sera généré automatiquement par Firebase une fois les DNS corrects
- Votre site fonctionne déjà sur : https://realtime-dc5d3.web.app
