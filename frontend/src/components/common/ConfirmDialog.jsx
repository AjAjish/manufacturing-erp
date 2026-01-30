import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  const variantClasses = {
    danger: 'btn-danger',
    primary: 'btn-primary',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={variantClasses[variant]}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}