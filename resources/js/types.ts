export interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'finance';
    phone: string | null;
    is_active: boolean;
}

export interface MenuItem {
    id: number;
    name: string;
    type: 'main_course' | 'snack' | 'dessert' | 'beverage';
}

export interface Addon {
    id: number;
    name: string;
    pricing_type: 'flat' | 'per_pax';
    price: number;
}

export interface PricingTier {
    id: number;
    package_id: number | null;
    min_pax: number;
    discount_percent: number;
    package?: Package | null;
}

export interface Activity {
    id: number;
    note: string;
    activity_type: 'call' | 'wa' | 'email' | 'meeting' | 'status_change';
    created_at: string;
    user?: { name: string };
}

export interface Quotation {
    id: number;
    package_id: number;
    package_name_snapshot: string;
    price_per_pax_snapshot: number;
    pax: number;
    addon_ids: number[] | null;
    addon_snapshot: any[] | null;
    event_date: string;
    event_location: string | null;
    subtotal: number;
    discount: number;
    total_estimate: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    notes: string | null;
    source: 'web' | 'whatsapp' | 'manual';
    status: 'new' | 'contacted' | 'negotiation' | 'deal' | 'lost';
    assigned_to: number | null;
    assigned_user?: { name: string } | null;
    lost_reason: string | null;
    created_at: string;
    activities?: Activity[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    packages: Package[];
}

export interface Package {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string;
    price_per_pax: number;
    min_pax: number;
    max_pax: number | null;
    thumbnail: string | null;
    menu_items: MenuItem[];
    pricing_tiers: PricingTier[];
    category?: Category;
}

export interface Testimonial {
    id: number;
    customer_name: string;
    event_type: string;
    rating: number;
    content: string;
    photo?: string | null;
    is_published: boolean;
}

export interface Gallery {
    id: number;
    title: string;
    image: string;
    event_date?: string;
    is_published: boolean;
}

export interface AuditLog {
    id: number;
    user_id: number | null;
    user?: { name: string } | null;
    action: string;
    model: string;
    model_id: number | null;
    before: any;
    after: any;
    created_at: string;
}
