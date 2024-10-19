import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps"
import '../echo';

export default function Room({ roomId }) {
    const myId = useRef(null);
    const videoGrid = useRef(null);
    const myPeer = useRef(new Peer(undefined, {
        host: '/',
        port: '3001',
    }));
    const peers = useRef({});
    useEffect(() => {
        const myVideo = document.createElement('video');
        myVideo.muted = true;
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream) => {
                addVideoStream(myVideo, stream);

                myPeer.current.on('open', (id) => {
                    myId.current = id;
                    axios.post('/join-room', {
                        roomId: roomId,
                        userId: id
                    }).then((res) => {
                        console.log(res['data']);
                    }).catch((err) => {
                        throw new Error(err);
                    });
                });

                myPeer.current.on('call', call => {
                    call.answer(stream);
                    const video = document.createElement('video');
                    call.on('stream', userVideoStream => {
                        addVideoStream(video, userVideoStream);
                    });
                });

                window.Echo.private(`room.${roomId}`)
                    .listen('NewUserConnected', (e) => {
                        connectToNewUser(e.userId, stream);
                        console.log('it came');
                    });
            });

        window.Echo.private(`room.${roomId}`)
            .listen('UserRemoved', (e) => {
                if (peers.current[e.userId]) {
                    peers.current[e.userId].close();
                    console.log(e)
                }
            });
    }, []);

    const connectToNewUser = (userId, stream) => {
        const call = myPeer.current.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });

        peers.current[userId] = call;
    };

    const addVideoStream = (videoDom, stream) => {
        videoDom.srcObject = stream;
        videoDom.addEventListener('loadedmetadata', () => {
            videoDom.play();
        });
        videoGrid.current.append(videoDom);
    };

    const hangup = (id) => {
        axios.post('/leave-room', {
            roomId: roomId,
            userId: id
        }).then((res) => {
            console.log(res['data']);
        }).catch((err) => {
            throw new Error(err);
        });
    };

    return (
        <>
            <div ref={videoGrid}></div>
            <button onClick={(myId) => hangup(myId.current)}>Close</button>
        </>
    );
}