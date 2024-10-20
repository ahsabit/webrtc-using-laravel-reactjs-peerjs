<?php

use App\Events\NewUserConnected;
use App\Events\UserRemoved;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;


Route::get('/rooms/{room}', function ($room) {
    return Inertia::render('Room', [
        'roomId' => $room
    ]);
})->middleware('auth')->name('rooms.show');

Route::post('/join-room', function (Request $request) {
    try {
        broadcast(new NewUserConnected($request->roomId, $request->userId))->toOthers();
        return response()->json(['message' => 'Sent join request']);
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => $th->getMessage(),
            'file' => $th->getFile(),
            'line' => $th->getLine()
        ], 500);
    }
});

Route::post('/leave-room', function (Request $request) {
    try {
        broadcast(new UserRemoved($request->roomId, $request->userId))->toOthers();
        return response()->json(['message' => 'Sent leave request']);
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => $th->getMessage(),
            'file' => $th->getFile(),
            'line' => $th->getLine()
        ], 500);
    }
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/rooms', function () {
    return redirect()->route('rooms.show', ['room' => Str::uuid()]);
})->middleware('auth');

require __DIR__.'/auth.php';
