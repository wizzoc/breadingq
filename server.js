const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const os = require('os');

const server = http.createServer((request, response) => {
    fs.readFile('index.html', (err, data) => {
        if (err) {
            response.writeHead(500);
            response.end('Error loading page');
            return;
        }
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(data);
    });
});

const io = new Server(server);

const queue = [];

io.on('connection', (socket) => {
    console.log('A client connected');

    socket.on('request_queue', () => {
        socket.emit('queue_update', queue);
    });

    socket.emit('queue_update', queue);

    socket.on('add_item', (data) => {
        const item = {
            id: Date.now().toString(),
            product: data.product,
            quantity: data.quantity,
            timestamp: Date.now()
        };
        queue.push(item);
        io.emit('queue_update', queue);
        console.log(item);
    });

    socket.on('remove_item', (id) => {
    const index = queue.findIndex((item) => item.id === id);
    if (index !== -1) {
        queue.splice(index, 1);
        io.emit('queue_update', queue);
    }
    });

    socket.on('reorder_item', (fromId, toId) => {
    const fromIndex = queue.findIndex((item) => item.id === fromId);
    const toIndex = queue.findIndex((item) => item.id === toId);
    
    if (fromIndex === -1 || toIndex === -1) {
        return;
    }
    
    const draggedItem = queue[fromIndex];
    queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, draggedItem);
    
    io.emit('queue_update', queue);
});
});

server.listen(1967, () => {
    function getLocalIP() {
        const interfaces = os.networkInterfaces();
        for (const name in interfaces) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return 'localhost';
    }

    const ip = getLocalIP();
    console.log('Server running at http://' + ip + ':1967');
});