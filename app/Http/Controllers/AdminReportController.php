<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\Package;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function dashboardStats()
    {
        $now = Carbon::now();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfMonth = $now->copy()->startOfMonth();

        // 1. Leads baru minggu ini
        $newLeadsThisWeek = Quotation::where('created_at', '>=', $startOfWeek)->count();

        // 2. Pipeline value (New, Contacted, Negotiation)
        $pipelineValue = Quotation::whereIn('status', ['new', 'contacted', 'negotiation'])
            ->sum('total_estimate');

        // 3. Deal bulan ini
        $dealsThisMonth = Quotation::where('status', 'deal')
            ->where('updated_at', '>=', $startOfMonth)
            ->count();
        $dealsValueThisMonth = Quotation::where('status', 'deal')
            ->where('updated_at', '>=', $startOfMonth)
            ->sum('total_estimate');

        // 4. Lead butuh follow-up hari ini (status new/contacted/negotiation dan tidak ada aktivitas >2 hari)
        $twoDaysAgo = Carbon::now()->subDays(2);
        
        $urgentLeads = Quotation::whereIn('status', ['new', 'contacted', 'negotiation'])
            ->where(function($query) use ($twoDaysAgo) {
                // No activities at all
                $query->whereNotExists(function($subQuery) {
                    $subQuery->select(DB::raw(1))
                        ->from('quotation_activities')
                        ->whereColumn('quotation_activities.quotation_id', 'quotations.id');
                })
                // Or last activity was more than 2 days ago
                ->orWhereNotExists(function($subQuery) use ($twoDaysAgo) {
                    $subQuery->select(DB::raw(1))
                        ->from('quotation_activities')
                        ->whereColumn('quotation_activities.quotation_id', 'quotations.id')
                        ->where('quotation_activities.created_at', '>=', $twoDaysAgo);
                });
            })
            ->with('assignedUser')
            ->orderBy('created_at', 'asc')
            ->get();

        // 5. Lead status donut chart data
        $statusDistribution = Quotation::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all statuses have a value
        $statuses = ['new', 'contacted', 'negotiation', 'deal', 'lost'];
        $formattedDistribution = [];
        foreach ($statuses as $st) {
            $formattedDistribution[] = [
                'name' => ucfirst($st),
                'value' => $statusDistribution[$st] ?? 0
            ];
        }

        return response()->json([
            'stats' => [
                'new_leads_this_week' => $newLeadsThisWeek,
                'pipeline_value' => (float)$pipelineValue,
                'deals_this_month' => $dealsThisMonth,
                'deals_value_this_month' => (float)$dealsValueThisMonth,
                'urgent_follow_up_count' => $urgentLeads->count(),
            ],
            'urgent_leads' => $urgentLeads,
            'status_distribution' => $formattedDistribution
        ]);
    }

    public function funnel()
    {
        // Funnel: All Leads (New) -> Contacted -> Negotiation -> Deal
        $totalLeads = Quotation::count(); // Stage 1
        
        $contactedLeads = Quotation::whereIn('status', ['contacted', 'negotiation', 'deal'])->count(); // Stage 2
        
        $negotiatedLeads = Quotation::whereIn('status', ['negotiation', 'deal'])->count(); // Stage 3
        
        $dealLeads = Quotation::where('status', 'deal')->count(); // Stage 4

        $lostLeads = Quotation::where('status', 'lost')->count();

        return response()->json([
            [
                'stage' => 'Simulasi (Lead Baru)',
                'count' => $totalLeads,
                'percentage' => 100,
            ],
            [
                'stage' => 'Dihubungi (Contacted)',
                'count' => $contactedLeads,
                'percentage' => $totalLeads > 0 ? round(($contactedLeads / $totalLeads) * 100) : 0,
            ],
            [
                'stage' => 'Negosiasi (Negotiation)',
                'count' => $negotiatedLeads,
                'percentage' => $totalLeads > 0 ? round(($negotiatedLeads / $totalLeads) * 100) : 0,
            ],
            [
                'stage' => 'Deal (Closing)',
                'count' => $dealLeads,
                'percentage' => $totalLeads > 0 ? round(($dealLeads / $totalLeads) * 100) : 0,
            ],
            [
                'stage' => 'Gagal (Lost)',
                'count' => $lostLeads,
                'percentage' => $totalLeads > 0 ? round(($lostLeads / $totalLeads) * 100) : 0,
            ]
        ]);
    }

    public function popularPackages()
    {
        // Query simulation count vs deal count per package
        $packagesReport = Quotation::select(
                'package_name_snapshot as name',
                DB::raw('count(*) as simulations'),
                DB::raw('sum(case when status = "deal" then 1 else 0 end) as deals')
            )
            ->groupBy('package_name_snapshot')
            ->orderBy('simulations', 'desc')
            ->get();

        return response()->json($packagesReport);
    }

    public function leadsByMonth()
    {
        // SQLite uses strftime for date grouping, MySQL uses DATE_FORMAT.
        // We will write a query compatible with SQLite for local dev, and check connection driver.
        $driverName = DB::connection()->getDriverName();

        if ($driverName === 'sqlite') {
            $monthExpression = "strftime('%Y-%m', created_at)";
        } else {
            // MySQL/PGSQL default
            $monthExpression = "DATE_FORMAT(created_at, '%Y-%m')";
        }

        $results = Quotation::select(
                DB::raw("{$monthExpression} as month"),
                'source',
                DB::raw('count(*) as count')
            )
            ->groupBy('month', 'source')
            ->orderBy('month', 'asc')
            ->get();

        // Process data for frontend line charts
        // Format desired: [{ month: '2026-05', web: 10, whatsapp: 5, manual: 2, total: 17 }]
        $chartData = [];
        $tempData = [];

        foreach ($results as $row) {
            $m = $row->month;
            if (!$m) continue;

            if (!isset($tempData[$m])) {
                $tempData[$m] = [
                    'month' => Carbon::parse($m . '-01')->format('M Y'),
                    'web' => 0,
                    'whatsapp' => 0,
                    'manual' => 0,
                    'total' => 0
                ];
            }

            $sourceKey = $row->source; // web, whatsapp, manual
            if (in_array($sourceKey, ['web', 'whatsapp', 'manual'])) {
                $tempData[$m][$sourceKey] += $row->count;
            }
            $tempData[$m]['total'] += $row->count;
        }

        return response()->json(array_values($tempData));
    }
}
