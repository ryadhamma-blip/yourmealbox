# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`your.mealbox` is a single-page French-language meal prep delivery website targeting Quebec. Customers fill out a contact form to place an order; the backend saves the order to an Excel file and sends confirmation emails to both the admin and the customer.

## Running the server

The production server is **Python/Flask** (`server.py`). The `package.json` and Node.js `server.js` reference in it are unused leftovers.

```bash
# Install Python dependencies
pip install flask openpyxl

# Run (serves on http://localhost:3000)
python server.py
```

Environment variables required for email sending (put in a `.env` file or export):
- `EMAIL_USER` — Gmail address used to send emails
- `EMAIL_PASS` — Gmail app password (not account password)

If these are not set, orders still save to Excel but emails are skipped with a warning.

## Architecture

**No build step.** The site is plain HTML/CSS/JS served directly by Flask's static file serving.

```
index.html   — Single-page site (navbar, hero, plans, testimonials, order form)
style.css    — All styles
script.js    — Frontend behavior (see below)
server.py    — Flask backend
commandes.xlsx — Auto-generated order log (gitignored, created on first order)
```

**Frontend (`script.js`)** handles: navbar scroll effect, mobile burger menu, weekly/monthly pricing toggle (CSS class swap), scroll-triggered animations via `IntersectionObserver`, order form submission to `/api/commande`, and counter animations for hero stats.

**Backend (`server.py`)** has two routes:
- `GET /` — serves `index.html`
- `POST /api/commande` — validates fields (`prenom`, `email`, `formule`, `jourLivraison`), appends a styled row to `commandes.xlsx` via openpyxl, then sends HTML emails to the admin (`ADMIN_EMAIL`) and the customer via Gmail SMTP SSL port 465.

The Excel file is created automatically with styled headers on first use; alternating row colors are applied per order.
