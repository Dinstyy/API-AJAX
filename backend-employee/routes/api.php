<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
// use App\Http\Controllers\CommentReplyController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('posts', PostController::class);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');

Route::delete('/delete-profile-picture', [AuthController::class, 'deleteProfilePicture'])->middleware('auth:sanctum');

Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->middleware('auth:sanctum');
Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->middleware('auth:sanctum');

Route::post('/comments/{id}/like', [CommentController::class, 'likeComment'])->middleware('auth:sanctum');

// Route::post('/comments/{comment}/reply', [CommentReplyController::class, 'store'])->middleware('auth:sanctum');
// Route::post('/replies/{reply}/like', [CommentReplyController::class, 'likeReply'])->middleware('auth:sanctum');
// Route::get('/comments/{comment}/replies', [CommentReplyController::class, 'index']);
