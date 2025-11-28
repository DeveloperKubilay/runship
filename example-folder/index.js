const express = require('express');

const app = express();
app.get('/', (req, res) => {
    res.send('Hello, guys!');
});

const PORT = 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});