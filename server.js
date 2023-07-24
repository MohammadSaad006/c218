const express = require("express");
const app = express();
const server = require("http").Server(app);
var nodeMailer = require("nodemailer")

app.use(express.json())
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const transpoter=nodeMailer.createTransport({
    port:587,
    host:"smtp.gmail.com",
    auth:{
        user:"mohammadsaad35786@gmail.com",
        pass:"kzaleaoqebsfrgva"
    },
    secure:true

})

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    },
    allowEIO3:true
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/sendmail",(req,res)=>{
    const to = req.body.to;
    const url = req.body.url;
    
    const mailData = {
        from : "mohammadsaad35786@gmail.com",
        to : to,
        subject : "JOIN THE VIDEO CHAT ",
        html:`<p>hey there ,</p><p>join me for video call here - ${url}</p>`
    };
    transpoter.sendMail(mailData,(error,info)=>{
        if (error){
            return console.log(error)
        }
        res.status(200).send({message:"invitation send",messageId:info.messageId})
    })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("USER-CONNECTED",userId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);