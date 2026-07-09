<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    public function getSettings()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'contact_whatsapp' => 'required|string',
            'contact_email' => 'required|email',
            'contact_address' => 'required|string',
            'whatsapp_template' => 'required|string',
            'notification_emails' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setByKey($key, $value);
        }

        return response()->json([
            'message' => 'Pengaturan berhasil diperbarui.',
            'settings' => Setting::all()->pluck('value', 'key')
        ]);
    }
}
