<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model {
    use HasFactory;

    protected $fillable = ['post_id', 'user_id', 'content', 'likes', 'comment_reply'];

    public function post() {
        return $this->belongsTo(Post::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function likes() {
        return $this->hasMany(CommentLike::class);
    }

    public function getTimeAgoAttribute() {
        return $this->created_at->diffForHumans();
    }

    public function isLikedByUser($userId) {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function replies() {
        return $this->hasMany(CommentReply::class);
    }
}
