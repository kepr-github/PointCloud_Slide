"""Simple HTTP server used to serve the presentation."""

from __future__ import annotations

import argparse
import http.server
import socket
import socketserver
import webbrowser
from contextlib import suppress
from typing import IO
import shutil


class RequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler that ignores broken pipe errors."""

    def copyfile(self, source: IO[bytes], outputfile: IO[bytes]) -> None:
        try:
            shutil.copyfileobj(source, outputfile)
        except BrokenPipeError:
            # Client disconnected before the response completed.
            pass


def find_free_port(start_port: int) -> int:
    """Return the first available port starting from ``start_port``."""
    port = start_port
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("localhost", port)) != 0:
                return port
        port += 1


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Start a local web server",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8000,
        help="Preferred port number (the next free port will be used if busy)",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically open a web browser",
    )
    return parser.parse_args()


def start_server(port: int, open_browser: bool) -> None:
    """Start the HTTP server on ``port``."""
    with socketserver.TCPServer(("", port), RequestHandler) as httpd:
        url = f"http://localhost:{port}/index.html"
        print(f"Serving at {url}")
        if open_browser:
            with suppress(Exception):
                webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server")


def main() -> None:
    args = parse_args()
    port = find_free_port(args.port)
    start_server(port, not args.no_browser)


if __name__ == "__main__":
    main()
