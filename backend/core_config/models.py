from django.db import models
from accounts.models import Organization

class TransactionType(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='transaction_types')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

class TransactionStatus(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='transaction_statuses')
    name = models.CharField(max_length=100)
    step_order = models.IntegerField(help_text="Order in the pipeline")

    class Meta:
        ordering = ['step_order']

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

class DateDefinition(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='date_definitions')
    name = models.CharField(max_length=100)
    is_milestone = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.organization.name})"
