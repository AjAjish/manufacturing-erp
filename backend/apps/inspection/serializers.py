"""
Serializers for Inspection app.
"""

from rest_framework import serializers
from .models import InspectionType, OrderInspection, InspectionChecklist


class InspectionTypeSerializer(serializers.ModelSerializer):
    """Serializer for InspectionType model."""

    stage_display = serializers.CharField(source='get_stage_display', read_only=True)

    class Meta:
        model = InspectionType
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class InspectionChecklistSerializer(serializers.ModelSerializer):
    """Serializer for InspectionChecklist model."""

    class Meta:
        model = InspectionChecklist
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class OrderInspectionSerializer(serializers.ModelSerializer):
    """Serializer for OrderInspection model."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    inspection_type_name = serializers.CharField(source='inspection_type.name', read_only=True)
    inspection_type_stage = serializers.CharField(source='inspection_type.get_stage_display', read_only=True)
    result_display = serializers.CharField(source='get_result_display', read_only=True)
    pass_rate = serializers.FloatField(read_only=True)
    can_dispatch = serializers.BooleanField(read_only=True)
    inspected_by_name = serializers.CharField(source='inspected_by.get_full_name', read_only=True)
    qa_approved_by_name = serializers.CharField(source='qa_approved_by.get_full_name', read_only=True)
    checklist_items = InspectionChecklistSerializer(many=True, read_only=True)

    class Meta:
        model = OrderInspection
        fields = '__all__'
        read_only_fields = [
            'id', 'is_qa_approved', 'qa_approved_by', 'qa_approved_at',
            'inspected_by', 'created_at', 'updated_at'
        ]


class OrderInspectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order inspections."""

    class Meta:
        model = OrderInspection
        fields = [
            'order', 'inspection_type', 'inspected_quantity',
            'passed_quantity', 'failed_quantity', 'rework_quantity',
            'result', 'inspection_date', 'defects_found', 'corrective_action', 'qa_remarks'
        ]

    def create(self, validated_data):
        from django.utils import timezone
        validated_data['inspected_by'] = self.context['request'].user
        validated_data['inspected_at'] = timezone.now()
        return super().create(validated_data)


class OrderInspectionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order inspections."""

    class Meta:
        model = OrderInspection
        fields = [
            'inspected_quantity', 'passed_quantity', 'failed_quantity',
            'rework_quantity', 'result', 'defects_found',
            'corrective_action', 'qa_remarks'
        ]


class QAApprovalSerializer(serializers.Serializer):
    """Serializer for QA approval."""

    approved = serializers.BooleanField()
    remarks = serializers.CharField(required=False, allow_blank=True)