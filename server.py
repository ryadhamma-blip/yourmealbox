import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
import openpyxl
from openpyxl import load_workbook

app = Flask(__name__, static_folder=".", static_url_path="")

ORDERS_FILE = "commandes.xlsx"
ADMIN_EMAIL = "amiratouati89@gmail.com"


def init_workbook():
    if not os.path.exists(ORDERS_FILE):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Commandes"
        ws.append(["Date", "Nom", "Email", "Téléphone", "Adresse", "Formule", "Jour de livraison", "Note"])
        wb.save(ORDERS_FILE)


def save_order(data):
    init_workbook()
    wb = load_workbook(ORDERS_FILE)
    ws = wb.active
    ws.append([
        datetime.now().strftime("%Y-%m-%d %H:%M"),
        data.get("prenom", ""),
        data.get("email", ""),
        data.get("telephone", ""),
        data.get("adresse", ""),
        data.get("formule", ""),
        data.get("jourLivraison", ""),
        data.get("note", ""),
    ])
    wb.save(ORDERS_FILE)


def send_email(data):
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")
    if not email_user or not email_pass:
        return

    body = f"""
Nouvelle commande reçue sur YourMealBox!

Prénom : {data.get('prenom', '')}
Email : {data.get('email', '')}
Téléphone : {data.get('telephone', '')}
Adresse : {data.get('adresse', '')}
Formule : {data.get('formule', '')}
Jour de livraison : {data.get('jourLivraison', '')}
Note : {data.get('note', '')}

Date : {datetime.now().strftime("%Y-%m-%d %H:%M")}
"""

    msg = MIMEMultipart()
    msg["From"] = email_user
    msg["To"] = ADMIN_EMAIL
    msg["Subject"] = f"Nouvelle commande – {data.get('prenom', 'Client')}"
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(email_user, email_pass)
            server.sendmail(email_user, ADMIN_EMAIL, msg.as_string())
    except Exception as e:
        print(f"Email error: {e}")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/api/commande", methods=["POST"])
def commande():
    data = request.get_json(force=True, silent=True) or {}
    if not data.get("prenom") or not data.get("email"):
        return jsonify({"error": "Nom et email requis"}), 400
    try:
        save_order(data)
        send_email(data)
        return jsonify({"success": True, "message": "Commande reçue!"}), 200
    except Exception as e:
        print(f"Order error: {e}")
        return jsonify({"error": "Erreur serveur"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=False)
