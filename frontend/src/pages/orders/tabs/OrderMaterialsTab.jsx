import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import api, { materialService } from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';

export default function OrderMaterialsTab({ order, onRefresh }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    required_quantity: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [order.id]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials/order-materials/by_order/', {
        params: { order_id: order.id },
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const response = await materialService.getAll({ is_active: true });
      setAllMaterials(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch all materials:', error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    fetchAllMaterials();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMaterial(null);
    setFormData({ required_quantity: '', notes: '' });
    setSearchTerm('');
  };

  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) {
      alert('Please select a material');
      return;
    }

    try {
      setSubmitting(true);
      await materialService.createOrderMaterial({
        order: order.id,
        material: selectedMaterial.id,
        required_quantity: parseFloat(formData.required_quantity),
        notes: formData.notes,
      });
      
      await fetchMaterials();
      closeModal();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to add material:', error);
      alert(error.response?.data?.detail || 'Failed to add material');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = allMaterials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <>
      <Card 
        title="Materials Required"
        actions={
          <button
            onClick={openModal}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Material</span>
          </button>
        }
      >
        {materials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Required Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Issued Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                        <p className="text-sm text-gray-500">{item.material_code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.required_quantity} {item.material_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.issued_quantity} {item.material_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.pending_quantity} {item.material_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} label={item.status_display} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No materials assigned to this order</p>
            <button
              onClick={openModal}
              className="btn-primary mt-4"
            >
              Add First Material
            </button>
          </div>
        )}
      </Card>

      {/* Add Material Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center justify-between"
                  >
                    <span>Add Material to Order</span>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Search Materials */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search and Select Material
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by name, code, or description..."
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Materials List */}
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {loadingMaterials ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : filteredMaterials.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {filteredMaterials.map((material) => (
                            <div
                              key={material.id}
                              onClick={() => handleSelectMaterial(material)}
                              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedMaterial?.id === material.id
                                  ? 'bg-primary-50 border-l-4 border-primary-500'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                        selectedMaterial?.id === material.id
                                          ? 'bg-primary-600'
                                          : 'bg-gray-400'
                                      }`}>
                                        {material.code.substring(0, 2).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {material.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Code: {material.code} | Grade: {material.grade || 'N/A'}
                                      </p>
                                      {material.description && (
                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                          {material.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0 text-right">
                                  <p className="text-sm text-gray-900">
                                    Stock: {material.stock_quantity} {material.unit}
                                  </p>
                                  {material.stock_quantity <= material.minimum_stock && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      Low Stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            {searchTerm ? 'No materials found matching your search' : 'No materials available'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Selected Material Details */}
                    {selectedMaterial && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-primary-900 mb-2">Selected Material</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedMaterial.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Code:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedMaterial.code}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Grade:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedMaterial.grade || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Available Stock:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedMaterial.stock_quantity} {selectedMaterial.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantity Input */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Required Quantity *
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          required
                          value={formData.required_quantity}
                          onChange={(e) => setFormData({ ...formData, required_quantity: e.target.value })}
                          className="input-field"
                          placeholder="Enter quantity"
                        />
                        {selectedMaterial && (
                          <p className="mt-1 text-xs text-gray-500">
                            Unit: {selectedMaterial.unit}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="input-field"
                          rows="3"
                          placeholder="Add any notes..."
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting || !selectedMaterial}
                      >
                        {submitting ? 'Adding...' : 'Add Material'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}