# 🥗 your.mealbox

Website for **your.mealbox** – a meal prep delivery service based in Quebec, Canada.

Customers choose a plan on the site and submit an order form. The order is automatically saved to an Excel file and confirmation emails are sent to both the customer and the admin.

---

## Tech stack

- **Frontend**: HTML / CSS / JavaScript (vanilla, no framework)
- **Backend**: Python / Flask
- **Data**: openpyxl → `commandes.xlsx`
- **Emails**: Gmail SMTP SSL (port 465)

---

## Installation

```bash
pip install flask openpyxl
```

Create a `.env` file at the project root:

```env
EMAIL_USER=your.address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> A Gmail app password can be generated under **Google Account → Security → App passwords**.

---

## Running the server

```bash
python server.py
```

The site is available at [http://localhost:3000](http://localhost:3000).

---

## How it works

1. The customer fills out the order form on the site.
2. The frontend sends a `POST /api/commande` request to the Flask server.
3. The server validates the fields and appends a row to `commandes.xlsx`.
4. Two HTML emails are sent: a summary to the admin, and a confirmation to the customer.

> `commandes.xlsx` is created automatically on the first order and is excluded from the git repository.

---

## Environment variables

| Variable | Description |
|---|---|
| `EMAIL_USER` | Gmail address used to send emails |
| `EMAIL_PASS` | Gmail app password |
