"""
Serializers for Engineering app.
"""

from rest_framework import serializers
from .models import Drawing, DrawingComment


class DrawingCommentSerializer(serializers.ModelSerializer):
    """Serializer for drawing comments."""

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = DrawingComment
        fields = ['id', 'drawing', 'user', 'user_name', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class DrawingListSerializer(serializers.ModelSerializer):
    """Serializer for drawing list view."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    drawing_type_display = serializers.CharField(source='get_drawing_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Drawing
        fields = [
            'id', 'order', 'order_quote_number', 'drawing_number', 'title',
            'drawing_type', 'drawing_type_display', 'version', 'revision',
            'is_latest', 'status', 'status_display', 'file_url', 'file_size',
            'file_type', 'created_by_name', 'created_at'
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class DrawingDetailSerializer(serializers.ModelSerializer):
    """Serializer for drawing detail view."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    order_project_name = serializers.CharField(source='order.project_name', read_only=True)
    drawing_type_display = serializers.CharField(source='get_drawing_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    comments = DrawingCommentSerializer(many=True, read_only=True)
    revision_count = serializers.SerializerMethodField()

    class Meta:
        model = Drawing
        fields = '__all__'
        read_only_fields = [
            'id', 'file_size', 'file_type', 'created_by', 'approved_by',
            'approved_at', 'created_at', 'updated_at'
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_revision_count(self, obj):
        return Drawing.objects.filter(
            order=obj.order,
            drawing_number=obj.drawing_number
        ).count()


class DrawingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating drawings."""

    class Meta:
        model = Drawing
        fields = [
            'order', 'drawing_number', 'title', 'description',
            'drawing_type', 'file', 'notes'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class DrawingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating drawings."""

    class Meta:
        model = Drawing
        fields = ['title', 'description', 'drawing_type', 'status', 'notes']


class DrawingNewVersionSerializer(serializers.Serializer):
    """Serializer for creating new drawing version."""

    file = serializers.FileField()
    notes = serializers.CharField(required=False, allow_blank=True)