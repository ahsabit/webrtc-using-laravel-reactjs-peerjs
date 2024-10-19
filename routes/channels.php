<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });


Broadcast::channel('room.{roomId}', function ($user, $roomId) {
    // Example authorization: Ensure the user has access to the room
    return true;
});
