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
    # strict multi-tenant filter
    deals = Transaction.objects.filter(organization=request.user.organization)

    # 1. Active Deals (Excluding Closed)
    active_count = deals.exclude(stage__in=['Closed Won', 'Closed Lost']).count()

    # 2. Closed Volume (Sum of Closed Won)
    closed_volume = deals.filter(stage='Closed Won').aggregate(total=Sum('value'))['total'] or 0

    # 3. Win Rate
    closed_won = deals.filter(stage='Closed Won').count()
    closed_lost = deals.filter(stage='Closed Lost').count()
    total_closed = closed_won + closed_lost
    win_rate = round((closed_won / total_closed * 100), 1) if total_closed > 0 else 0

    # 4. Funnel Data (For Chart)
    # Group by stage and count
    funnel_data = list(deals.values('stage').annotate(count=Count('id')).order_by('count'))

    # 5. Recent Activity
    recent_activity = deals.order_by('-created_at')[:5].values(
        'id', 'property__address', 'value', 'stage', 'created_at'
    )

    # 6. Today's Schedule (Strict Filter)
    today = timezone.localdate()
    todays_events = Event.objects.filter(
        organization=request.user.organization,
        start_time__date=today
    ).order_by('start_time').values('id', 'title', 'start_time', 'type')

    return Response({
        "total_active_deals": active_count,
        "closed_volume": closed_volume,
        "win_rate": win_rate,
        "deals_by_status": funnel_data,
        "recent_transactions": recent_activity,
        "todays_schedule": list(todays_events)
    })
