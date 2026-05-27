if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


const { sequelize } = require('./models/index');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-app-name.vercel.app' // Add your Vercel URL after deploying
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const leadRoutes = require('./routes/leadRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'AI CRM API is running 🚀' });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Sync DB and start server
const PORT = process.env.PORT || 8000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database synced');
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ DB connection failed:', err.message);
    });

module.exports = { io };