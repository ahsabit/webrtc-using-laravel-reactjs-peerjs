<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewUserConnected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $roomId;
    public $userId;

    /**
     * Create a new event instance.
     */
    public function __construct($roomId, $userId)
    {
        $this->roomId = $roomId;
        $this->userId = $userId;
    }

    public function broadcastWith()
    {
        return [
            "roomId" => $this->roomId,
            "userId" => $this->userId
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        return [
            new PrivateChannel('room.' . $this->roomId),
        ];
    }
}
