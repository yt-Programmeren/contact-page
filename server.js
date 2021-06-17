import express from 'express';
const app = express();

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}))

import Datastore from 'nedb';
const database = new Datastore('contacts.db');
database.loadDatabase();

const PasswordDatabase = new Datastore('passwords.db');
PasswordDatabase.loadDatabase();

import bcrypt from 'bcrypt';

app.get('/', (req, res) => res.redirect('/contact'));

app.post('/send_contact', (req, res) => database.insert(req.body))

app.post('/register', (req, res) => {
    PasswordDatabase.find({email: req.body.email}, (err, data) => {if ( data.length > 0 ) return})
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if ( err ) {
            res.end();
            return;
        }
        PasswordDatabase.insert({name: req.body.name, email: req.body.email, password: hash});
    })
});

app.post('/login', (req, res) => {
    PasswordDatabase.find({email: req.body.email}, (err, data) => {
        if ( !data[0] ) return;
        bcrypt.compare(req.body.password, data[0].password, (err, result) => {
            if (result === false) res.json(false);
            if (result) database.find({}, (err, data) => res.json(data));
        })

    })
})

app.listen(80);