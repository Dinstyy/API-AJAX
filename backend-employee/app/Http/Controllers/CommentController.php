<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller {
    public function index($postId) {
        $comments = Comment::where('post_id', $postId)
            ->with(['user:id,name,profile_photo', 'replies.user:id,name,profile_photo'])
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, $postId) {
        $request->validate(['content' => 'required']);

        $comment = Comment::create([
            'post_id' => $postId,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json($comment, 201);
    }

    public function destroy(Comment $comment) {

        if (Gate::denies('delete-comment', $comment)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }

    public function likeComment($id, Request $request) {
            $comment = Comment::findOrFail($id);
            $userId = $request->user()->id;

            $existingLike = CommentLike::where('comment_id', $id)->where('user_id', $userId)->first();

            if ($existingLike) {
                $existingLike->delete();
                $comment->decrement('likes');
                return response()->json(['likes' => $comment->likes, 'liked' => false]);
            } else {
                CommentLike::create([
                    'comment_id' => $id,
                    'post_id' => $comment->post_id,
                    'user_id' => $userId,
                ]);

                $comment->increment('likes');
                return response()->json(['likes' => $comment->likes, 'liked' => true]);
        }
    }
}
