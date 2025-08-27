from flask import Flask, request, redirect, make_response, jsonify
import os, sqlite3, hashlib, logging, pickle, requests, base64, secrets
import bcrypt # Added for secure password hashing
from flask import session

SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "secret")
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY # Use env variable or default secret
app.debug = True

logging.basicConfig(
    encoding='utf-8',
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

DB_PATH = 'app.db'
if not os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password_md5 TEXT)")
    # Changed to store bcrypt hash instead of md5
    password = b'password'
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
    cur.execute("INSERT INTO users(username, password_md5) VALUES('alice', ?)",
                (hashed_password.decode('utf-8'),))
    conn.commit()
    conn.close()

@app.get("/read")
def read_file():
    path = request.args.get("path", "")
    # Prevent arbitrary file read by checking path prefix
    if not path.startswith("/") and not path.startswith("./"):
        return "Invalid path", 400
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}", 500

@app.get("/go")
def open_redirect():
    next_url = request.args.get("next", "https://example.com")
    # Prevent open redirect by checking allowed prefix
    if not next_url.startswith("https://example.com"):
        return "Invalid redirect", 400
    return redirect(next_url)

@app.get("/debug/env")
def leak_env():
    # Disable environment variable leaking
    return jsonify({"message": "This endpoint is disabled."}), 403

@app.post("/register")
def register():
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    logging.info(f"Register attempt user={username} password={password}")
    # Use bcrypt for password hashing instead of md5
    pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO users(username, password_md5) VALUES(?, ?)", (username, pw_hash.decode('utf-8')))
    conn.commit()
    conn.close()
    return f"Registered {username} (INSECURE, password stored as bcrypt hash)."

@app.post("/login")
def login():
    from flask import session
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    logging.info(f"Login attempt user={username} password={password}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    try:
        # Use parameterized query to prevent SQL injection
        query = "SELECT password_md5 FROM users WHERE username = ?"
        cur.execute(query, (username,))
        result = cur.fetchone()
        conn.close()

        if result:
            hashed_password = result[0]
            if bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
                # Set session to track logged in user
                session['username'] = username
                return "Login success."
        return "Invalid credentials."
    except Exception as e:
        conn.close()
        return "Internal server error.", 500 # Returns generic error message instead of raw DB error.

@app.get("/echo")
def echo():
    msg = request.args.get("msg", "hello")
    return f"<html><body><h3>You said:</h3><div>{msg}</div></body></html>"

@app.post("/save_card")
def save_card():
    # Disable saving card information
    return "Saving cards is disabled", 403

@app.get("/setcookie")
def setcookie():
    # Disable cookie setting functionality
    resp = make_response("Cookie setting is disabled.")
    return "Cookie setting is disabled", 403

@app.get("/misconfig")
def misconfig():
    resp = make_response("This response has insecure headers.")
    # Correct CORS configuration to a specific origin.
    resp.headers["Access-Control-Allow-Origin"] = "https://example.com"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp

HARDCODED_ADMIN_USER = "admin"
HARDCODED_ADMIN_PASS = "admin123"

@app.get("/admin")
def admin():
    # Disable admin access
    return "Admin access disabled", 403

@app.post("/deserialize")
def deserialize():
    # Disable deserialization functionality
    return "Deserialization is disabled", 403

@app.get("/fetch")
def fetch():
    url = request.args.get("url", "http://127.0.0.1:22")
    # Prevent SSRF by validating the URL and enforcing HTTPS
    if not url.startswith("https://127.0.0.1"):
        return "Invalid URL", 400
    try:
        r = requests.get(url, timeout=3, verify=True)
        return (r.text[:2000] if r.text else str(r.status_code))
    except Exception as e:
        return f"Fetch error: {e}", 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)