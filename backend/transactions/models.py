from django.db import models
from accounts.models import Organization
from core_config.models import TransactionType, TransactionStatus

class Contact(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    ROLE_CHOICES = [
        ('Buyer', 'Buyer'),
        ('Seller', 'Seller'),
        ('Agent', 'Agent'),
        ('Other', 'Other'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Buyer')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Property(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='properties')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    list_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Enhanced fields
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Pending', 'Pending'),
        ('Sold', 'Sold'),
    ]
    PROPERTY_TYPE_CHOICES = [
        ('Single Family', 'Single Family'),
        ('Condo', 'Condo'),
        ('Townhouse', 'Townhouse'),
        ('Multi-Family', 'Multi-Family'),
        ('Land', 'Land'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, default='Single Family')
    bedrooms = models.IntegerField(default=0)
    bathrooms = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    square_feet = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Properties"

    def __str__(self):
        return self.address

class Transaction(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='transactions')
    name = models.CharField(max_length=255)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='transactions')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='transactions')
    type = models.ForeignKey(TransactionType, on_delete=models.PROTECT, related_name='transactions', null=True, blank=True)
    status = models.ForeignKey(TransactionStatus, on_delete=models.PROTECT, related_name='transactions', null=True, blank=True)
    
    STAGE_CHOICES = [
        ('Prospect', 'Prospect'),
        ('Active', 'Active'),
        ('Under Contract', 'Under Contract'),
        ('Closed Won', 'Closed Won'),
        ('Closed Lost', 'Closed Lost'),
    ]
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='Prospect')
    value = models.DecimalField(max_digits=12, decimal_places=2, help_text="Deal Value", default=0.00)
    close_date = models.DateField(null=True, blank=True)
    
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage (e.g. 2.50)", default=2.5)
    
    # User requested fields
    detailed_status = models.CharField(max_length=100, blank=True, null=True, help_text="Specific status details")
    property_type = models.CharField(max_length=50, choices=Property.PROPERTY_TYPE_CHOICES, blank=True, null=True)

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
