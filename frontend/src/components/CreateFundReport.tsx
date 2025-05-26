import React, { useState, useRef } from 'react';
import { CreateFundReportRequest } from '../types/index';
import api from '../api/axios';
import { X, Plus, Image as ImageIcon } from 'lucide-react';

interface CreateFundReportProps {
    fundId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateFundReport: React.FC<CreateFundReportProps> = ({ fundId, onSuccess, onCancel }) => {
    const [description, setDescription] = useState('');
    const [totalSpent, setTotalSpent] = useState('');
    const [expenses, setExpenses] = useState<string[]>(['']);
    const [purchases, setPurchases] = useState<string[]>(['']);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddExpense = () => {
        setExpenses([...expenses, '']);
    };

    const handleAddPurchase = () => {
        setPurchases([...purchases, '']);
    };

    const handleExpenseChange = (index: number, value: string) => {
        const newExpenses = [...expenses];
        newExpenses[index] = value;
        setExpenses(newExpenses);
    };

    const handlePurchaseChange = (index: number, value: string) => {
        const newPurchases = [...purchases];
        newPurchases[index] = value;
        setPurchases(newPurchases);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...newPhotos]);
            
            // Создаем превью для новых фотографий
            newPhotos.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            
            // Создаем объект с данными отчета
            const reportData = {
                description,
                totalSpent: parseFloat(totalSpent),
                expenses: expenses.filter(expense => expense.trim() !== ''),
                purchases: purchases.filter(purchase => purchase.trim() !== '')
            };

            // Добавляем данные отчета как JSON-строку
            formData.append('request', new Blob([JSON.stringify(reportData)], {
                type: 'application/json'
            }));

            // Добавляем фотографии
            if (photos.length > 0) {
                photos.forEach(photo => formData.append('photos', photo));
            }

            await api.post(`/api/funds/${fundId}/reports`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            setError('Не удалось создать отчет. Пожалуйста, попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Создать отчет о фонде</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Опишите, как были использованы собранные средства и какие результаты были достигнуты"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Общая сумма расходов
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={totalSpent}
                            onChange={(e) => setTotalSpent(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Расходы
                    </label>
                    <div className="space-y-2">
                        {expenses.map((expense, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={expense}
                                    onChange={(e) => handleExpenseChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Введите расход"
                                />
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setExpenses(prev => prev.filter((_, i) => i !== index))}
                                        className="p-2 text-red-600 hover:text-red-800"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddExpense}
                        className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                        <Plus size={16} />
                        <span>Добавить расход</span>
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Покупки
                    </label>
                    <div className="space-y-2">
                        {purchases.map((purchase, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={purchase}
                                    onChange={(e) => handlePurchaseChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Введите покупку"
                                />
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setPurchases(prev => prev.filter((_, i) => i !== index))}
                                        className="p-2 text-red-600 hover:text-red-800"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddPurchase}
                        className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                        <Plus size={16} />
                        <span>Добавить покупку</span>
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Фотографии
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ImageIcon size={20} className="text-gray-400" />
                            <span className="text-gray-600">Выбрать фотографии</span>
                        </button>
                        
                        {photoPreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {photoPreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Фото ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Создание...' : 'Создать отчет'}
                    </button>
                </div>
            </form>
        </div>
    );
}; 