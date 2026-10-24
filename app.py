from flask import Flask, request, jsonify, render_template, Response
import sqlite3
from datetime import date
import csv
import io
import requests


app = Flask(__name__)
DB_NAME = "expenses.db"

CATEGORIES = {
    "Food", "Travel", "Education",
    "Shopping", "Entertainment", "Other"
}


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            expense_date TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM expenses ORDER BY expense_date DESC, id DESC"
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])


@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()
    category = data.get("category", "")
    expense_date = data.get("expense_date", "")

    try:
        amount = float(data.get("amount", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount"}), 400

    if not title or len(title) > 100:
        return jsonify({"error": "Enter a valid expense name"}), 400

    if category not in CATEGORIES:
        return jsonify({"error": "Select a valid category"}), 400

    if not (0 < amount <= 10000000):
        return jsonify({"error": "Enter a valid amount"}), 400

    try:
        date.fromisoformat(expense_date)
    except (ValueError, TypeError):
        return jsonify({"error": "Enter a valid date"}), 400

    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO expenses
           (title, category, amount, expense_date)
           VALUES (?, ?, ?, ?)""",
        (title, category, amount, expense_date)
    )
    conn.commit()
    expense_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Expense added successfully",
        "id": expense_id
    }), 201


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    conn = get_db()
    cursor = conn.execute(
        "DELETE FROM expenses WHERE id = ?", (expense_id,)
    )
    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return jsonify({"error": "Expense not found"}), 404

    return jsonify({"message": "Expense deleted successfully"})

@app.route("/api/expenses/export", methods=["GET"])
def export_expenses():
    output = io.StringIO(newline="")
    writer = csv.writer(output)

    # CSV column headings
    writer.writerow([
        "Expense Name",
        "Category",
        "Amount (INR)",
        "Date"
    ])

    conn = get_db()
    rows = conn.execute("""
        SELECT title, category, amount, expense_date
        FROM expenses
        ORDER BY expense_date DESC, id DESC
    """).fetchall()
    conn.close()

    for row in rows:
        writer.writerow([
            row["title"],
            row["category"],
            row["amount"],
            row["expense_date"]
        ])

    csv_content = "\ufeff" + output.getvalue()

    return Response(
        csv_content,
        mimetype="text/csv",
        headers={
            "Content-Disposition":
                "attachment; filename=student_expenses.csv"
        }
    )
if __name__ == "__main__":
    init_db()
    app.run(debug=True)
    import requests

def get_gemma_suggestion(expense_data):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:1b",
                "prompt": (
                    "Analyze these student expenses and "
                    "give practical savings suggestions: "
                    + str(expense_data)
                ),
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()
        return response.json()["response"]

    except requests.RequestException:
        return "AI is temporarily unavailable. Please try again."


def get_gemma_suggestion(expense_data):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:1b",
                "prompt": f"""
                You are a student expense advisor.
                Analyze these expenses: {expense_data}
                Give 3 practical savings suggestions.
                """,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()
        return response.json()["response"]

    except requests.RequestException as e:
        print("Gemma connection error:", e)
        return "Unable to generate AI suggestions right now."
    import requests

def get_gemma_suggestion(expense_data):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:1b",
                "prompt": (
                    "You are a student expense advisor. "
                    "Analyze these expenses and give 3 practical "
                    f"money-saving suggestions: {expense_data}"
                ),
                "stream": False
            },
            timeout=120
        )
        response.raise_for_status()
        return response.json()["response"]

    except requests.RequestException as e:
        print("Gemma connection error:", e)
        return "AI suggestions are temporarily unavailable."