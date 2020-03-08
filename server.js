const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server);
const chalk = require('chalk');

app.get('/', function (req, res) { //localhost:3000/ --> Hello Word
    res.send('Hello World!');
});

io.on('connection', function (socket) {
    const id_handshake = socket.id;
    let {payload} = socket.handshake.query;
    console.log(`${chalk.blue(`Nuevo dispositivo conectado: ${id_handshake}`)}`);
    if (!payload) {
        console.log(`${chalk.red(`Sin payload`)}`);
    } else {
        payload = JSON.parse(payload)
        // console.log(payload)

        socket.join(`room_${payload.id}`); //Creamso una sala para el usaurio
        console.log(`${chalk.yellow(`El dispositivo ${id_handshake} se unio a -> ${`room_${payload.id}`}`)}`);
        socket.emit('message', {
            msg: `Hola tu eres el dispositivo ${id_handshake}, perteneces a la sala room_${payload.id}, de ${payload.user}`
        });

        socket.on('default', function(res){

            switch (res.event) {
                case 'message':

                    const inPayloadCookie = JSON.parse(res.cookiePayload);
                    const inPayload = res.payload;
                    io.to(`room_${inPayloadCookie.id}`).emit('message',{
                        msg: `Mensaje a todos los dispositivos de la sala room__${inPayloadCookie.id}: ${inPayload.message}`
                    });

                    break;
            }

        }); // listen to the event
    }
    ;

    // console.log( socket.handshake.headers['user-agent']); //Obtener navegador



    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

server.listen(5000, function () {
    console.log('\n')
    console.log(`>> Socket listo y escuchando por el puerto: ${chalk.green('5000')}`)
})

app.listen(3000, function () {
    console.log(`>> Express listo y escuchando por el puerto: ${chalk.green('3000')}`)
    console.log('\n')
});
