import argparse
import http.server
import socket
import socketserver
import webbrowser

Handler = http.server.SimpleHTTPRequestHandler


def find_free_port(start_port: int) -> int:
    """Return the first available port starting from ``start_port``."""
    port = start_port
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("localhost", port)) != 0:
                return port
        port += 1


def main() -> None:
    parser = argparse.ArgumentParser(description="Start a local web server")
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8000,
        help="Preferred port number (the next free port will be used if busy)",
    )
    args = parser.parse_args()
    port = find_free_port(args.port)

    with socketserver.TCPServer(("", port), Handler) as httpd:
        url = f"http://localhost:{port}/index.html"
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
