import http.server
import socketserver
import webbrowser

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

def main():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print(f"Serving at {url}")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server")

if __name__ == "__main__":
    main()
