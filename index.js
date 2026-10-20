const express = require('express');
const cors = require('cors');

const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = process.env.MONGO_URI || require('./config').mongoURI;
const client = new MongoClient(mongoURI);


let db;

async function connectToDatabase() {
    await client.connect();
    db = client.db('AfterSchoolDB');
    console.log('Connected to MongoDB!');
}

connectToDatabase();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
console.log(`${req.method} request to ${req.url}`);
next();
});
app.use('/images', express.static('images'));

app.use('/images', (req, res) => {
res.status(404).json({ error: 'Image not found' });
});





app.post('/orders', async (req, res) => {
    const newOrder = req.body;
    await db.collection('orders').insertOne(newOrder);
    console.log('New order received:', newOrder);
    res.json({ message: 'Order placed successfully!', order: newOrder });
});




app.put('/lessons/:id', async (req, res) => {
    const lessonId = Number(req.params.id);

    const result = await db.collection('lessons').updateOne(
        { LessonID: lessonId },
        { $set: { availableSlots: req.body.availableSlots } }
    );

    if (result.matchedCount === 0) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
    }

    res.json({ message: 'Lesson updated successfully!' });
});



app.get('/', (req, res) => {
    res.send('Backend Runs');
});

app.get('/lessons', async (req, res) => {
    const allLessons = await db.collection('lessons').find().toArray();
    res.json(allLessons);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});