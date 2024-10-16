const express = require('express');
const { Client } = require('ssh2');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle SSH connections
app.post('/ssh', (req, res) => {
   const { host, username, password, command } = req.body;
   const conn = new Client();

   conn.on('ready', () => {
      console.log('Client :: ready');
      conn.exec(command, (err, stream) => {
         if (err) throw err;

         let data = '';

         stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
            res.json({ output: data, code, signal });
         }).on('data', (chunk) => {
            data += chunk;
         }).stderr.on('data', (chunk) => {
            console.error('STDERR: ' + chunk);
         });
      });
   }).connect({
      host: host,
      port: 22,
      username: username,
      password: password
   });

});

app.listen(port, () => {
   console.log(`API listening on http://localhost:${port}`);
});