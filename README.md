# BreadingQ

A real-time shared queue for a restaurant kitchen's breading station. Anyone can add a request from any iPad in the kitchen, and every iPad shows the same ordered list within a moment. It has been trialled during real shifts in the kitchen where I work.

<p align="center"><img src="assets/screenshot.png" alt="BreadingQ on an iPad" width="400"></p>

## Why it exists

In a busy kitchen, the breading station needs to know what to bread next and in what order, while requests come from several people at once. BreadingQ gives everyone one shared, ordered list on the iPads already in the kitchen. Nothing needs installing: each iPad just opens a page in Safari.

## Features

- **Tap to add, hold for quantity.** A tap adds one. A long press opens a quantity picker: preset sizes for nuggets, a number for everything else.
- **Live on every screen.** Every add, removal and reorder appears on every connected device right away.
- **Tap to clear.** Tapping a finished item removes it for everyone.
- **Reorder** by dragging, or by tapping an item's position number and choosing a new spot.
- **English / Spanish per device.** Each person picks their own language without affecting anyone else's screen.
- **Timestamps** show when each request was added.
- **Local network only:** no internet, no accounts, no hosting costs.

## How it works

```
 iPads (Safari)                          One machine on the store Wi-Fi
┌──────────────┐  add / remove / reorder  ┌───────────────────────────┐
│  index.html  │ ───────────────────────▶ │  server.js (Node.js)      │
│              │                          │  holds the queue array    │
│              │ ◀─────────────────────── │  Socket.IO on port 1967   │
└──────────────┘  full queue, to everyone └───────────────────────────┘
```

- **The server is the single source of truth.** The queue lives in one array on the server. The iPads hold no state of their own; they only display what the server last sent.
- **Clients send intents, and the server broadcasts state.** A tap sends a small event (`add_item`, `remove_item`, `reorder_item`). The server applies it, then sends the entire queue to every connected device, which redraws its list from it.
- **WebSockets, through Socket.IO.** Each iPad keeps one open connection, so updates are pushed the moment they happen, with no polling. Socket.IO also reconnects automatically when an iPad wakes from sleep, and a reconnecting device gets the current queue straight away.

## Design decisions

| Decision | Reason |
|---|---|
| Broadcast the **full queue** after every change, not just the change | Devices can never drift out of sync, and reconnects use the same message. The queue is small, so the extra bytes don't matter |
| Act on items **by ID, not position** | Another device may change the list between drawing and a tap. A position could then point at the wrong item; an ID can't |
| Rely on **Node's single-threaded event loop** | Simultaneous taps are handled one at a time, so the queue is never modified by two requests at once |
| **No framework, no build step:** plain HTML/CSS/JS and Node's built-in `http` | One dependency (Socket.IO). Edit a file, refresh, done |
| **In-memory queue** | A queue only matters for one shift, so no database is needed |

## Running it

Requires [Node.js](https://nodejs.org/).

```
npm install
node server.js
```

The server prints its address, for example `Server running at http://192.168.1.20:1967`. Open that address in Safari on any device connected to the same Wi-Fi. Safari's **Share → Add to Home Screen** gives it an app icon.

## Known limitations and roadmap

- It's built for a trusted local network, with no login or input validation yet.
- Touch drag-and-drop only registers when released over a row's edge. The fix is planned.
- Adding a product means editing the product list in `index.html`.

## Built with

Node.js · Socket.IO 4 · HTML, CSS and JavaScript
