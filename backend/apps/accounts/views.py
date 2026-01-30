"""
Views for accounts app.
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    RolePermissionSerializer
)
from .models import RolePermission
from .permissions import IsAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with additional user data."""
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(generics.GenericAPIView):
    """Logout view to blacklist refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'detail': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users."""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        """Update current user profile."""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change current user password."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password changed successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def change_role(self, request, pk=None):
        """Change user role (Admin only)."""
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in dict(User.Role.choices):
            return Response(
                {'detail': 'Invalid role specified.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.role = new_role
        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def toggle_active(self, request, pk=None):
        """Toggle user active status (Admin only)."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response(UserSerializer(user).data)


class RolePermissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing role permissions."""
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = RolePermission.objects.all()
        role = self.request.query_params.get('role')
        module = self.request.query_params.get('module')
        
        if role:
            queryset = queryset.filter(role=role)
        if module:
            queryset = queryset.filter(module=module)
        
        return queryset

    @action(detail=False, methods=['get'])
    def by_role(self, request):
        """Get all permissions for a specific role."""
        role = request.query_params.get('role')
        if not role:
            return Response(
                {'detail': 'Role parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        permissions = RolePermission.objects.filter(role=role)
        serializer = self.get_serializer(permissions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update permissions for a role."""
        role = request.data.get('role')
        permissions = request.data.get('permissions', [])
        
        if not role:
            return Response(
                {'detail': 'Role is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_perms = []
        for perm in permissions:
            obj, created = RolePermission.objects.update_or_create(
                role=role,
                module=perm.get('module'),
                defaults={'access_level': perm.get('access_level', 'none')}
            )
            updated_perms.append(obj)
        
        serializer = self.get_serializer(updated_perms, many=True)
        return Response(serializer.data)