<?php

namespace App\Http\Controllers;

use App\Models\CommentReply;
use Illuminate\Http\Request;
use App\Models\Comment;

class CommentReplyController extends Controller {
    public function store(Request $request, $commentId) {
        $request->validate(['content' => 'required']);

        $reply = CommentReply::create([
            'comment_id' => $commentId,
            'post_id' => $request->post_id,
            'content' => $request->content,
        ]);

        Comment::where('id', $commentId)->increment('comment_reply');

        return response()->json($reply, 201);
    }

    public function likeReply($id, Request $request) {
        $reply = CommentReply::findOrFail($id);
        $reply->increment('comment_likes');

        return response()->json(['likes' => $reply->comment_likes]);
    }
}
