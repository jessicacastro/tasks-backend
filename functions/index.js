const functions = require('firebase-functions');
const app = require('express')();
const admin = require('firebase-admin');

admin.initializeApp();

const database = admin.firestore().collection('tasks');

// get all tasks from database
app.get('/tasks', (req, res) => {
    database.get()
        .then((data) => {
            let tasks = [];
            data.forEach((doc) => {
                tasks.push({
                    taskId: doc.id,
                    title: doc.data().title,
                    description: doc.data().description,
                    status: doc.data().status,
                    createdAt: doc.data().createdAt
                });
            });

            return res.json(tasks);
        })
        .catch((err) => console.error(err));
})

app.post('/tasks', (req, res) => {
    const newTask = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        createdAt: new Date()
    };

    database.add(newTask)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
})

app.get('/tasks/:taskId', (req, res) => {
    let taskData = {};

    database.doc(req.params.taskId).get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Task not found' });
            }

            taskData = doc.data();

            return res.json(taskData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
})

app.put('/tasks/:taskId', (req, res) => {
    const document = database.doc(req.params.taskId);

    document.update(req.body)
        .then(() => {
            res.json({ message: 'Document updated successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
})

app.delete('/tasks/:taskId', (req, res) => {
    const document = database.doc(req.params.taskId);

    document.delete()
        .then(() => {
            res.json({ message: 'Document deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
})




exports.api = functions.https.onRequest(app);