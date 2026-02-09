export interface Property {
    id: number;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    price: number;
    status: 'Active' | 'Pending' | 'Sold';
    property_type: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family' | 'Land';
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    created_at?: string;
}

export interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: 'Buyer' | 'Seller' | 'Agent' | 'Other';
    created_at: string;
}

export interface Deal {
    id: number;
    title?: string;
    property: number;
    property_address?: string;
    contact: number;
    client_name?: string;
    stage: 'NEW' | 'NEGOTIATION' | 'UNDER_CONTRACT' | 'CLOSED_WON' | 'CLOSED_LOST';
    value: number;
    close_date: string;
}

export interface Task {
    id: number;
    title: string;
    is_completed: boolean;
    due_date?: string;
    created_at: string;
}

export interface Event {
    id: number;
    title: string;
    start_time: string;
    type: 'Call' | 'Meeting' | 'Email' | 'Other';
}
