<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /**
     * Determine if the given comment can be deleted by the user.
     */
    public function delete(User $user, Comment $comment)
    {
        return $user->id === $comment->post->user_id;
    }
}
