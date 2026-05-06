"""
your.mealbox – Flask server
• Serves static files (index.html, style.css, script.js)
• POST /api/commande → saves to commandes.xlsx + sends emails
"""

import os, smtplib, datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# ─── Configuration ───────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
ORDERS_FILE = BASE_DIR / "commandes.xlsx"
ADMIN_EMAIL = "amiratouati89@gmail.com"

# → Fill in your Gmail credentials here (or use environment variables)
EMAIL_USER = os.getenv("EMAIL_USER", "")   # your Gmail address
EMAIL_PASS = os.getenv("EMAIL_PASS", "")   # Gmail app password

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")

# ─── Excel ───────────────────────────────────────────────────────────────────
HEADERS = ["Date", "Prénom", "Email", "Formule", "Jour de livraison", "Message / Adresse", "Statut"]
COL_WIDTHS = [22, 16, 30, 32, 20, 45, 14]

def style_header(ws):
    green_fill = PatternFill("solid", fgColor="2E7D32")
    white_font = Font(color="FFFFFF", bold=True, size=11)
    center     = Alignment(horizontal="center", vertical="center")
    for col_idx, (header, width) in enumerate(zip(HEADERS, COL_WIDTHS), start=1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.fill      = green_fill
        cell.font      = white_font
        cell.alignment = center
        ws.column_dimensions[cell.column_letter].width = width
    ws.row_dimensions[1].height = 28

def get_workbook():
    if ORDERS_FILE.exists():
        return load_workbook(ORDERS_FILE)
    wb = Workbook()
    ws = wb.active
    ws.title = "Commandes"
    style_header(ws)
    wb.save(ORDERS_FILE)
    return wb

def ajouter_commande(data: dict):
    wb = get_workbook()
    ws = wb["Commandes"]

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

    # Alternating row color
    row_idx  = ws.max_row + 1
    bg_color = "F9FBF9" if row_idx % 2 == 0 else "FFFFFF"
    fill     = PatternFill("solid", fgColor=bg_color)
    thin     = Side(style="thin", color="E0E0E0")
    border   = Border(bottom=Side(style="thin", color="E0E0E0"))

    values = [now, data["prenom"], data["email"], data["formule"],
              data["jourLivraison"], data.get("message", "-"), "🆕 Nouvelle"]

    for col_idx, val in enumerate(values, start=1):
        cell            = ws.cell(row=row_idx, column=col_idx, value=val)
        cell.fill       = fill
        cell.border     = border
        cell.alignment  = Alignment(vertical="center", wrap_text=True)
        if col_idx == 7:                          # Status column → orange
            cell.font = Font(color="E65100", bold=True)
        ws.row_dimensions[row_idx].height = 22

    wb.save(ORDERS_FILE)
    print(f"✅ Order saved: {data['prenom']} – {data['formule']}")

# ─── Email ───────────────────────────────────────────────────────────────────
def envoyer_email(to: str, subject: str, html: str):
    if not EMAIL_USER or not EMAIL_PASS:
        print("⚠️  Email not sent: EMAIL_USER / EMAIL_PASS not configured in .env or environment variables.")
        return

    msg = MIMEMultipart("alternative")
    msg["From"]    = f"your.mealbox <{EMAIL_USER}>"
    msg["To"]      = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_USER, EMAIL_PASS)
        smtp.sendmail(EMAIL_USER, to, msg.as_string())
    print(f"📧 Email sent → {to}")

def email_admin(data):
    html = f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
      <div style="background:linear-gradient(135deg,#2E7D32,#4CAF50);padding:30px 36px">
        <h1 style="color:#fff;margin:0;font-size:22px">🥗 your.mealbox</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Nouvelle commande reçue !</p>
      </div>
      <div style="padding:30px 36px;background:#fff">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#F9FBF9"><td style="padding:10px 14px;font-weight:600;color:#616161;width:40%">👤 Client</td><td style="padding:10px 14px"><strong>{data['prenom']}</strong></td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#616161">📧 Email</td><td style="padding:10px 14px"><a href="mailto:{data['email']}" style="color:#2E7D32">{data['email']}</a></td></tr>
          <tr style="background:#F9FBF9"><td style="padding:10px 14px;font-weight:600;color:#616161">📦 Formule</td><td style="padding:10px 14px;color:#FF6D00;font-weight:700">{data['formule']}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#616161">📅 Livraison</td><td style="padding:10px 14px;font-weight:700">{data['jourLivraison']}</td></tr>
          <tr style="background:#F9FBF9"><td style="padding:10px 14px;font-weight:600;color:#616161;vertical-align:top">📝 Message</td><td style="padding:10px 14px">{data.get('message') or 'Aucun message'}</td></tr>
        </table>
        <div style="margin-top:24px;padding:14px 18px;background:#E8F5E9;border-radius:10px;border-left:4px solid #2E7D32">
          <p style="margin:0;font-size:13px;color:#2E7D32;font-weight:600">✅ Commande automatiquement ajoutée dans <strong>commandes.xlsx</strong></p>
        </div>
      </div>
      <div style="padding:18px;background:#F9FBF9;text-align:center;font-size:12px;color:#9E9E9E">© 2025 your.mealbox · Québec, Canada</div>
    </div>"""
    envoyer_email(ADMIN_EMAIL, f"🍱 Nouvelle commande – {data['prenom']} ({data['jourLivraison']})", html)

def email_client(data):
    html = f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
      <div style="background:linear-gradient(135deg,#FF6D00,#FF9800);padding:30px 36px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">🥗 your.mealbox</h1>
        <p style="color:rgba(255,255,255,.9);margin:10px 0 0">Merci pour ta commande, {data['prenom']} ! 🎉</p>
      </div>
      <div style="padding:30px 36px;background:#fff;text-align:center">
        <p style="color:#1B2B1C;font-size:16px">Ta demande a bien été reçue !</p>
        <div style="background:#F9FBF9;border-radius:12px;padding:20px;margin:20px 0;text-align:left">
          <p style="margin:8px 0;font-size:14px">📦 <strong>Formule :</strong> {data['formule']}</p>
          <p style="margin:8px 0;font-size:14px">📅 <strong>Livraison :</strong> {data['jourLivraison']}</p>
        </div>
        <p style="color:#616161;font-size:14px">Notre équipe te contacte sous <strong>24h</strong> pour finaliser. 💚</p>
        <a href="https://instagram.com/your.mealbox" style="display:inline-block;margin-top:16px;background:#2E7D32;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">📸 Suivre @your.mealbox</a>
      </div>
      <div style="padding:18px;background:#F9FBF9;text-align:center;font-size:12px;color:#9E9E9E">© 2025 your.mealbox · Québec, Canada</div>
    </div>"""
    envoyer_email(data["email"], "✅ Ta commande your.mealbox est confirmée !", html)

# ─── Routes ──────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(str(BASE_DIR), "index.html")

@app.route("/api/commande", methods=["POST"])
def commande():
    d = request.get_json(force=True)
    prenom        = (d.get("prenom") or "").strip()
    email         = (d.get("email") or "").strip()
    formule       = (d.get("formule") or "").strip()
    jour_livraison = (d.get("jourLivraison") or "").strip()
    message       = (d.get("message") or "").strip()

    if not all([prenom, email, formule, jour_livraison]):
        return jsonify(success=False, error="Champs obligatoires manquants."), 400

    data = dict(prenom=prenom, email=email, formule=formule,
                jourLivraison=jour_livraison, message=message)

    # 1. Excel
    try:
        ajouter_commande(data)
    except Exception as e:
        print("Excel error:", e)
        return jsonify(success=False, error="Error saving to Excel."), 500

    # 2. Emails (non-blocking on failure)
    try:
        email_admin(data)
        email_client(data)
    except Exception as e:
        print("⚠️  Email error:", e)

    return jsonify(success=True, message="Commande enregistrée avec succès !")

if __name__ == "__main__":
    print("\n🥗 your.mealbox – Server running at http://localhost:3000")
    print(f"📊 Orders → {ORDERS_FILE}\n")
    app.run(host="0.0.0.0", port=3000, debug=False)
