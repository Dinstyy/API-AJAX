<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed'
        ]);

        $user = User::create($fields);

        $token = $user->createToken($request->name);

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return [
                'errors' => [
                    'email' => ['The provided credentials are incorrect.']
                ]
            ];
            // return [
            //     'message' => 'The provided credentials are incorrect.'
            // ];
        }

        $token = $user->createToken($user->name);

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return [
            'message' => 'You are logged out.'
        ];
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|max:255|unique:users,email,' . $user->id,
            'bio' => 'nullable|string|max:500',
            'profile_photo' => 'nullable|string',
        ]);

        $user->update($validatedData);

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user], 200);
    }

    public function deleteProfilePicture(Request $request)
    {
        $user = $request->user();

        if (!$user->profile_photo) {
            return response()->json(['message' => 'No profile picture found'], 404);
        }

        Storage::delete($user->profile_photo);

        $user->profile_photo = null;
        $user->save();

        return response()->json(['message' => 'Profile picture deleted successfully'], 200);
    }

}
