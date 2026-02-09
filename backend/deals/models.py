from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

from transactions.models import Contact

class Deal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, related_name='deals')
    
    STAGE_CHOICES = [
        ('NEW', 'New'),
        ('NEGOTIATION', 'Negotiation'),
        ('UNDER_CONTRACT', 'Under Contract'),
        ('CLOSED_WON', 'Closed Won'),
        ('CLOSED_LOST', 'Closed Lost'),
    ]
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='NEW')
    
    value = models.DecimalField(max_digits=12, decimal_places=2)
    probability = models.IntegerField(default=10)
    closing_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.client_name}"
