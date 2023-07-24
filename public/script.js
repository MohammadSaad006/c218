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
    video.addEventListener("loadedmetadata",()=>{
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

    $("#mute_button").click(function(){
        const enabled = Mystream.getAudioTracks()[0].enabled
        if (enabled){
            Mystream.getAudioTracks()[0].enabled=false
            html =`<i class="fas fa-microphone-slash"></i>`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(html)
        }
        else {
            Mystream.getAudioTracks()[0].enabled=true
            html=`<i class="fas fa-microphone"></i>`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(html)
        }
    })

    $("#stop_video").click(function() {
        const enabled = Mystream.getVideoTracks()[0].enabled;
        if (enabled) {
            Mystream.getVideoTracks()[0].enabled = false;
            html = `<i class="fas fa-video-slash"></i>`;
            $("#stop_video").toggleClass("background_red");
            $("#stop_video").html(html)
        } else {
            Mystream.getVideoTracks()[0].enabled = true;
            html = `<i class="fas fa-video"></i>`;
            $("#stop_video").toggleClass("background_red");
            $("#stop_video").html(html)
        }
    })

    $("#invite").click(function(){
        const to = prompt("TYPE YOUR FRIEND'S EMAIL") 
        let data = {url:window.location.href,to:to}
        console.log(data)
        $.ajax({
            url:"/send-email",
            type:"post",
            data:JSON.stringify(data),
            dataType:"json",
            contentType:"application/json",
            sucess:function(result){
                alert("INVITE SENT.....")
            },
            error:function(result){
                console.log(result.responseJSON)
            }
        })
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