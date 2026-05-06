# 🥗 your.mealbox

Site web de commande pour **your.mealbox** – service de meal prep livré à domicile au Québec.

Les clients choisissent une formule via le site et soumettent un formulaire de commande. La commande est automatiquement enregistrée dans un fichier Excel et des emails de confirmation sont envoyés au client et à l'administrateur.

---

## Stack technique

- **Frontend** : HTML / CSS / JavaScript (vanilla, aucun framework)
- **Backend** : Python / Flask
- **Données** : openpyxl → `commandes.xlsx`
- **Emails** : Gmail SMTP SSL (port 465)

---

## Installation

```bash
pip install flask openpyxl
```

Crée un fichier `.env` à la racine :

```env
EMAIL_USER=ton.adresse@gmail.com
EMAIL_PASS=mot_de_passe_application_gmail
```

> Le mot de passe d'application Gmail se génère dans **Compte Google → Sécurité → Mots de passe des applications**.

---

## Lancer le serveur

```bash
python server.py
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Fonctionnement

1. Le client remplit le formulaire de commande sur le site.
2. Le frontend envoie un `POST /api/commande` au serveur Flask.
3. Le serveur valide les champs et ajoute une ligne dans `commandes.xlsx`.
4. Deux emails HTML sont envoyés : un récapitulatif à l'admin, une confirmation au client.

> `commandes.xlsx` est généré automatiquement à la première commande et est exclu du dépôt git.

---

## Variables d'environnement

| Variable | Description |
|---|---|
| `EMAIL_USER` | Adresse Gmail utilisée pour envoyer les emails |
| `EMAIL_PASS` | Mot de passe d'application Gmail |
