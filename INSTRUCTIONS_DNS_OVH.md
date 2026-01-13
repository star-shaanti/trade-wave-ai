# Instructions pour configurer les DNS dans OVH

## Configuration du domaine racine

### Étape 1 : Obtenir les IPs Firebase

**IMPORTANT** : Avant de modifier l'enregistrement DNS, vous devez obtenir les adresses IP depuis Firebase Console :

1. Allez sur : https://console.firebase.google.com/project/realtime-dc5d3/hosting
2. Cliquez sur le domaine `realtimetradingsignals.com`
3. Firebase vous montrera les **enregistrements DNS à configurer**
4. **Notez les 2 adresses IP** (Firebase donne généralement 2 enregistrements A)

Exemple de ce que Firebase peut donner :
```
Type: A
Nom: @
Valeur: 151.101.1.195

Type: A
Nom: @
Valeur: 151.101.65.195
```

### Étape 2 : Modifier l'enregistrement A dans OVH

#### Pour le domaine racine (realtimetradingsignals.com) :

1. **Sous-domaine** : **LAISSEZ VIDE** ✅ (cela configure le domaine racine @)
2. **TTL** : "Par défaut" ou 3600 (c'est bien)
3. **Cible** : Remplacez l'IP actuelle (`199.36.158.100` ou `66.115.166.238`) par la **PREMIÈRE IP Firebase**
4. Cliquez sur "Suivant" puis validez

### Étape 3 : Ajouter le deuxième enregistrement A

Firebase nécessite généralement **2 enregistrements A** pour le domaine racine. Vous devez donc :

1. **Créer un deuxième enregistrement A** :
   - Cliquez sur "Ajouter une entrée" ou "Ajouter un enregistrement"
   - Choisissez "Type A"
   - **Sous-domaine** : **LAISSEZ VIDE** ✅
   - **TTL** : "Par défaut"
   - **Cible** : La **DEUXIÈME IP Firebase**
   - Validez

### Résumé

- ✅ **Sous-domaine = VIDE** pour le domaine racine
- ✅ **2 enregistrements A** avec les 2 IPs Firebase
- ✅ **Cible = Les IPs fournies par Firebase** (pas l'ancienne IP)

## Alternative : Configuration avec CNAME (si disponible)

Si Firebase propose un CNAME au lieu d'enregistrements A :

1. **Sous-domaine** : **LAISSEZ VIDE**
2. **Type** : CNAME (au lieu de A)
3. **Cible** : `realtime-dc5d3.web.app`

**Note** : Certains registrars (comme OVH) ne permettent pas de CNAME sur la racine. Dans ce cas, utilisez les enregistrements A.

## Vérification après configuration

Une fois les DNS modifiés :

1. Attendez 15-30 minutes (propagation DNS)
2. Vérifiez dans Firebase Console que le domaine est validé
3. Visitez : https://realtimetradingsignals.com
4. Vous devriez voir votre site Firebase au lieu de l'ancien serveur
