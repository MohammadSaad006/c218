const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");

const MYvideo = document.createElement("video")
MYvideo.muted=true

let Mystream

function addVideoStream(video,stream){
    video.srcObject=stream
    video.addEventLisner("loadedmetadata",()=>{
        video.play()
        $("#video_Grid").append(video)
    })
}

navigator.mediaDevices.getUserMedia({video:true,audio:true})
.then((stream)=>{
    Mystream=stream
    addVideoStream(MYvideo,stream)
    socket.on("USER-CONNECTED",(userId)=>{
        connectToNewUser(userId,stream)
    })
    peer.on("call",(call)=>{
        call.answer(stream)
        const video = document.createElement("video")
        call.on("stream",(userVideoStream)=>{
            addVideoStream(video,userVideoStream)
        })
    })
})

function connectToNewUser(userId,stream){
    const call = peer.call(userId,stream)
    const video = document.createElement("video")

    call.on("stream",(userVideoStream)=>{
        addVideoStream(video,userVideoStream)

    })
}


$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })


})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});