from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from transactions.models import Transaction
from interactions.models import Event

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    org = request.user.organization
    today = timezone.localdate()
    current_year = today.year

    # --- 1. FINANCIALS (Source: Transaction) ---
    transactions = Transaction.objects.filter(organization=org)
    
    # Total Lifetime Sales (Closed Won)
    total_sales_volume = transactions.filter(stage='Closed Won').aggregate(sum=Sum('value'))['sum'] or 0
    
    # Total Transactions Count (All time)
    total_transactions = transactions.count()
    
    # Current Year Volume (Closed Won this year)
    current_year_volume = transactions.filter(
        stage='Closed Won', 
        close_date__year=current_year
    ).aggregate(sum=Sum('value'))['sum'] or 0
    
    # Current Year Transactions Count
    current_year_count = transactions.filter(created_at__year=current_year).count()
    
    # Commission Due (Pending/Active * Commission Rate)
    # Assuming commission_rate is percentage (e.g. 2.5) -> value * (rate / 100)
    # Using 'Active' and 'Under Contract' stages as simplified 'Pending' bucket
    pending_transactions = transactions.filter(stage__in=['Active', 'Under Contract'])
    commission_due = 0
    for t in pending_transactions:
        if t.value and t.commission_rate:
            commission_due += t.value * (t.commission_rate / 100)
            
    # Recent Transactions for Activity Feed
    recent_transactions = transactions.order_by('-created_at')[:5].values(
        'id', 'name', 'value', 'stage', 'created_at', 'detailed_status'
    )

    # --- 2. PIPELINE (Source: Deal) ---
    # Need to import Deal model. If not available, use Transaction as fallback for now 
    # but based on plan we should separate. 
    # Checking imports... Deal is in deals.models. 
    from deals.models import Deal
    deals = Deal.objects.filter(user=request.user) # Deals are per user or org? Model says user.
    
    # Active Pipeline Value
    active_pipeline_val = deals.filter(stage__in=['NEW', 'NEGOTIATION', 'UNDER_CONTRACT']).aggregate(sum=Sum('value'))['sum'] or 0
    
    # Win Rate (Closed Won / (Closed Won + Closed Lost))
    won = deals.filter(stage='CLOSED_WON').count()
    lost = deals.filter(stage='CLOSED_LOST').count()
    total_closed = won + lost
    deal_win_rate = round((won / total_closed * 100), 1) if total_closed > 0 else 0


    # --- 3. SCHEDULE ---
    todays_events = Event.objects.filter(
        organization=org,
        start_time__date=today
    ).order_by('start_time').values('id', 'title', 'start_time', 'type')[:5]

    return Response({
        "financials": {
            "total_sales_volume": total_sales_volume,
            "total_transactions": total_transactions,
            "current_year_volume": current_year_volume,
            "current_year_transactions": current_year_count,
            "commission_due": commission_due,
        },
        "pipeline": {
            "active_value": active_pipeline_val,
            "win_rate": deal_win_rate,
            "active_count": deals.exclude(stage__in=['CLOSED_WON', 'CLOSED_LOST']).count()
        },
        "recent_activity": list(recent_transactions),
        "todays_schedule": list(todays_events)
    })
