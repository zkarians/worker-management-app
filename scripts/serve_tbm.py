import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

def main():
    tbm_dir = r"D:\.gemini\antigravity\scratch\TBM"
    os.chdir(tbm_dir)
    port = int(os.environ.get("PORT", "8000"))
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Preview: http://localhost:{port}/TBM.htm")
    httpd.serve_forever()

if __name__ == "__main__":
    main()
