import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps"
import '../echo';

export default function Room({ roomId }) {
    const myId = useRef(null); // To pass as the argument when manually closing a connection
    const videoGrid = useRef(null);
    const localVideoDom = useRef(null);
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
                localVideoDom.current.srcObject = stream;

                myPeer.current.on('call', call => {
                    call.answer(stream);
                    const video = document.createElement('video');
                    call.on('stream', userVideoStream => {
                        addVideoStream(video, userVideoStream);
                    });
                    call.on('close', () => {
                        video.remove();
                    });
                });

                window.Echo.private(`room.${roomId}`)
                    .listen('NewUserConnected', (e) => {
                        connectToNewUser(e.userId, stream);
                        console.log('nwe user came');
                    })
                    .listen('UserRemoved', (e) => {
                        if (peers.current[e.userId]) {
                            peers.current[e.userId].close();
                            console.log(e)
                        }
                    });
            });

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
            <div ref={videoGrid}>
                <video ref={localVideoDom} autoPlay playsInline></video>
            </div>
            <button onClick={() => hangup(myId.current)}>Close</button>
        </>
    );
}