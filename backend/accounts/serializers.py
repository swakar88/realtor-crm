from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['organization_id'] = user.organization.id if user.organization else None
        token['role'] = user.role
        token['username'] = user.username

        return token
