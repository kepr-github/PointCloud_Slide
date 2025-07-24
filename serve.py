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
import asyncio
import threading
from typing import Set
import json
import websockets


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


clients: Set[websockets.WebSocketServerProtocol] = set()


async def ws_handler(websocket: websockets.WebSocketServerProtocol) -> None:
    """Receive a message and broadcast it to other clients."""
    clients.add(websocket)
    try:
        async for message in websocket:
            disconnected = []
            for client in clients:
                if client is not websocket:
                    try:
                        await client.send(message)
                    except Exception:
                        disconnected.append(client)
            for dc in disconnected:
                clients.discard(dc)
    finally:
        clients.discard(websocket)


async def run_ws_server(port: int) -> None:
    async with websockets.serve(ws_handler, "", port):
        await asyncio.Future()


def start_server(port: int, open_browser: bool) -> None:
    """Start the HTTP server and WebSocket server on ``port``."""
    ws_port = port + 1

    def run_ws() -> None:
        asyncio.run(run_ws_server(ws_port))

    ws_thread = threading.Thread(target=run_ws, daemon=True)
    ws_thread.start()

    with socketserver.TCPServer(("", port), RequestHandler) as httpd:
        url = f"http://localhost:{port}/index.html"
        print(f"Serving at {url}")
        print(f"WebSocket at ws://localhost:{ws_port}")
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
