<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\QuotationActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminLeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Quotation::with('assignedUser');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        // Standard sorted by newest
        $leads = $query->orderBy('created_at', 'desc')->get();

        return response()->json($leads);
    }

    public function show($id)
    {
        $lead = Quotation::with(['assignedUser', 'activities.user'])->findOrFail($id);
        return response()->json($lead);
    }

    public function updateStatus(Request $request, $id)
    {
        $lead = Quotation::findOrFail($id);
        $oldStatus = $lead->status;

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,negotiation,deal,lost',
            'lost_reason' => 'required_if:status,lost|nullable|string',
        ]);

        $lead->status = $validated['status'];
        if ($validated['status'] === 'lost') {
            $lead->lost_reason = $validated['lost_reason'];
        } else {
            $lead->lost_reason = null;
        }
        $lead->save();

        // Create timeline activity record
        $note = "Mengubah status lead dari '" . ucfirst($oldStatus) . "' menjadi '" . ucfirst($lead->status) . "'";
        if ($lead->status === 'lost') {
            $note .= " (Alasan: " . $lead->lost_reason . ")";
        }

        QuotationActivity::create([
            'quotation_id' => $lead->id,
            'user_id' => Auth::id(),
            'note' => $note,
            'activity_type' => 'status_change',
        ]);

        return response()->json([
            'message' => 'Status lead berhasil diperbarui.',
            'lead' => $lead->load('activities.user')
        ]);
    }

    public function assign(Request $request, $id)
    {
        $lead = Quotation::findOrFail($id);
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
        ]);

        $lead->assigned_to = $validated['user_id'];
        $lead->save();

        $assigneeName = $lead->assignedUser ? $lead->assignedUser->name : 'Unassigned';
        QuotationActivity::create([
            'quotation_id' => $lead->id,
            'user_id' => Auth::id(),
            'note' => "Menugaskan lead ke: {$assigneeName}",
            'activity_type' => 'status_change',
        ]);

        return response()->json([
            'message' => 'Tanggung jawab lead berhasil diperbarui.',
            'lead' => $lead->load('assignedUser', 'activities.user')
        ]);
    }

    public function addActivity(Request $request, $id)
    {
        $lead = Quotation::findOrFail($id);

        $validated = $request->validate([
            'note' => 'required|string',
            'activity_type' => 'required|in:call,wa,email,meeting,status_change',
        ]);

        $activity = QuotationActivity::create([
            'quotation_id' => $lead->id,
            'user_id' => Auth::id(),
            'note' => $validated['note'],
            'activity_type' => $validated['activity_type'],
        ]);

        // Auto transition status if first contact is made
        if ($lead->status === 'new' && in_array($validated['activity_type'], ['call', 'wa', 'email'])) {
            $lead->status = 'contacted';
            $lead->save();

            QuotationActivity::create([
                'quotation_id' => $lead->id,
                'user_id' => Auth::id(),
                'note' => "Sistem mengubah status lead dari 'New' menjadi 'Contacted' karena adanya kontak pertama.",
                'activity_type' => 'status_change',
            ]);
        }

        return response()->json([
            'message' => 'Catatan follow-up berhasil ditambahkan.',
            'activity' => $activity->load('user'),
            'lead' => $lead->load('activities.user')
        ], 201);
    }
}
