import React, { useEffect, useState } from 'react';
import { Fund } from '../types/index';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const CompletedFunds: React.FC = () => {
    const [funds, setFunds] = useState<Fund[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fundImages, setFundImages] = useState<Record<number, string>>({});

    useEffect(() => {
        loadCompletedFunds();
    }, []);

    const loadCompletedFunds = async () => {
        try {
            const response = await api.get('/api/funds');
            const completedFunds = response.data.filter((fund: Fund) => fund.status === 'COMPLETED');
            setFunds(completedFunds);

            // Загружаем изображения для каждого фонда
            for (const fund of completedFunds) {
                try {
                    const imageResponse = await api.get(`/api/funds/${fund.id}/image`, {
                        responseType: 'blob',
                    });
                    const url = URL.createObjectURL(imageResponse.data);
                    setFundImages(prev => ({
                        ...prev,
                        [fund.id]: url
                    }));
                } catch (error) {
                    console.error('Ошибка при загрузке изображения:', error);
                }
            }
        } catch (err) {
            setError('Не удалось загрузить завершенные фонды');
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
                <p className="font-medium">{error}</p>
                <button 
                    onClick={loadCompletedFunds}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (funds.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <CheckCircle2 size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">Завершенные фонды пока отсутствуют</p>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-light tracking-tight">
                        Успешно завершенные фонды
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 font-light">
                        Посмотрите, как ваша помощь изменила жизни людей
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funds.map((fund) => (
                        <Link
                            key={fund.id}
                            to={`/funds/${fund.id}`}
                            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative aspect-video">
                                {fundImages[fund.id] ? (
                                    <img
                                        src={fundImages[fund.id]}
                                        alt={fund.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-gray-400 font-light">Нет изображения</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <CheckCircle2 size={20} className="text-green-400" />
                                        <span className="text-sm font-light">Успешно завершен</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-light mb-2 group-hover:text-blue-600 transition-colors">
                                    {fund.title}
                                </h3>
                                <p className="text-gray-600 line-clamp-2 mb-4 font-light">
                                    {fund.description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-2xl font-light text-blue-600">
                                            {formatMoney(fund.currentAmount)}
                                        </div>
                                        <div className="text-sm text-gray-500 font-light">
                                            из {formatMoney(fund.targetAmount)}
                                        </div>
                                    </div>
                                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={24} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}; 