import React, { useEffect, useState, useCallback } from 'react';
import { FundReport } from '../types/index';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, X, Download, Info, Loader2 } from 'lucide-react';

interface FundReportsProps {
    fundId: number;
}

export const FundReports: React.FC<FundReportsProps> = ({ fundId }) => {
    const [reports, setReports] = useState<FundReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<{ url: string | null; index: number; reportId: number } | null>(null);
    // const [showInfo, setShowInfo] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [preloadedPhotos, setPreloadedPhotos] = useState<Set<string>>(new Set());
    const [photoBlobs, setPhotoBlobs] = useState<Record<string, string>>({});

    useEffect(() => {
        loadReports();
    }, [fundId]);

    useEffect(() => {
        if (reports.length > 0) {
            reports.forEach(report => {
                report.photos.forEach(photo => {
                    const photoKey = `${report.id}-${photo.id}`;
                    if (!photoBlobs[photoKey]) {
                        loadPhoto(report.id, photo.id);
                    }
                });
            });
        }
    }, [reports]);

    const loadReports = async () => {
        try {
            const response = await api.get(`/api/funds/${fundId}/reports`);
            setReports(response.data);
        } catch (err) {
            setError('Не удалось загрузить отчеты');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2
        }).format(amount);
    };
    useCallback((url: string) => {
        if (preloadedPhotos.has(url)) return;

        const img = new Image();
        img.src = url;
        img.onload = () => {
            setPreloadedPhotos(prev => new Set([...prev, url]));
        };
    }, [preloadedPhotos]);
    const loadPhoto = async (reportId: number, photoId: number) => {
        try {
            const response = await api.get(`/api/funds/${fundId}/reports/${reportId}/photos/${photoId}`, {
                responseType: 'blob'
            });
            const blob = response.data;
            const url = URL.createObjectURL(blob);
            setPhotoBlobs(prev => ({
                ...prev,
                [`${reportId}-${photoId}`]: url
            }));
            return url;
        } catch (err) {
            console.error('Ошибка при загрузке фото:', err);
            return null;
        }
    };

    const handlePhotoClick = async (reportId: number, photoId: number, index: number) => {
        setPhotoLoading(true);
        const photoKey = `${reportId}-${photoId}`;
        let photoUrl: string | null = photoBlobs[photoKey];
        
        if (!photoUrl) {
            photoUrl = await loadPhoto(reportId, photoId);
        }
        
        if (photoUrl) {
            setSelectedPhoto({ url: photoUrl, index, reportId });
            
            // Предзагрузка следующей и предыдущей фотографий
            const currentReport = reports.find(r => r.id === reportId);
            if (currentReport) {
                if (index > 0) {
                    const prevPhoto = currentReport.photos[index - 1];
                    const prevPhotoKey = `${reportId}-${prevPhoto.id}`;
                    if (!photoBlobs[prevPhotoKey]) {
                        loadPhoto(reportId, prevPhoto.id);
                    }
                }
                if (index < currentReport.photos.length - 1) {
                    const nextPhoto = currentReport.photos[index + 1];
                    const nextPhotoKey = `${reportId}-${nextPhoto.id}`;
                    if (!photoBlobs[nextPhotoKey]) {
                        loadPhoto(reportId, nextPhoto.id);
                    }
                }
            }
        } else {
            setError('Не удалось загрузить фотографию');
        }
        setPhotoLoading(false);
    };

    const handleNextPhoto = () => {
        if (!selectedPhoto) return;
        const currentReport = reports.find(r => r.id === selectedPhoto.reportId);
        if (!currentReport) return;

        if (selectedPhoto.index < currentReport.photos.length - 1) {
            const nextPhoto = currentReport.photos[selectedPhoto.index + 1];
            handlePhotoClick(currentReport.id, nextPhoto.id, selectedPhoto.index + 1);
        }
    };

    const handlePrevPhoto = () => {
        if (!selectedPhoto) return;
        const currentReport = reports.find(r => r.id === selectedPhoto.reportId);
        if (!currentReport) return;

        if (selectedPhoto.index > 0) {
            const prevPhoto = currentReport.photos[selectedPhoto.index - 1];
            handlePhotoClick(currentReport.id, prevPhoto.id, selectedPhoto.index - 1);
        }
    };

    const handleDownloadPhoto = async (url: string, fileName: string) => {
        try {
            const response = await api.get(url, {
                responseType: 'blob'
            });
            const blob = response.data;
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Ошибка при скачивании фото:', err);
        }
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center max-w-2xl mx-auto">
                <p className="font-medium">{error}</p>
                <button 
                    onClick={loadReports}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <Info size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">Отчеты пока отсутствуют</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    Отчет от {formatDate(report.createdAt)}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Фонд: {report.fundTitle}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-semibold text-blue-600">
                                    {formatMoney(report.totalSpent)}
                                </div>
                                <div className="text-sm text-gray-500">Общая сумма расходов</div>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{report.description}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Расходы
                                </h4>
                                <ul className="space-y-3">
                                    {report.expenses.map((expense, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2"></span>
                                            <span className="text-gray-700">{expense}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Покупки
                                </h4>
                                <ul className="space-y-3">
                                    {report.purchases.map((purchase, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2"></span>
                                            <span className="text-gray-700">{purchase}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {report.photos.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                    Фотографии
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {report.photos.map((photo, index) => {
                                        const photoKey = `${report.id}-${photo.id}`;
                                        const photoUrl = photoBlobs[photoKey];
                                        return (
                                            <div
                                                key={photo.id}
                                                className="relative aspect-square cursor-pointer group"
                                                onClick={() => handlePhotoClick(report.id, photo.id, index)}
                                            >
                                                {photoUrl ? (
                                                    <img
                                                        src={photoUrl}
                                                        alt={`Фото ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <Loader2 size={24} className="text-gray-400 animate-spin" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="bg-white bg-opacity-90 rounded-full p-2">
                                                        <Info size={20} className="text-gray-700" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Модальное окно для просмотра фотографий */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-95"></div>
                    <div className="absolute top-4 right-4 flex gap-4 z-10">
                        <button
                            onClick={() => handleDownloadPhoto(selectedPhoto.url, `photo-${selectedPhoto.index + 1}.jpg`)}
                            className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
                            title="Скачать фото"
                        >
                            <Download size={24} />
                        </button>
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
                            title="Закрыть"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <button
                        onClick={handlePrevPhoto}
                        className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-50 transition-colors p-2 rounded-full hover:bg-white/10 z-10"
                        disabled={selectedPhoto.index === 0}
                        title="Предыдущее фото"
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <div className="relative max-h-[90vh] max-w-[90vw] z-10">
                        {photoLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Loader2 size={48} className="text-white animate-spin" />
                            </div>
                        )}
                        <img
                            src={selectedPhoto.url}
                            alt="Фото отчета"
                            className={`max-h-[90vh] max-w-[90vw] object-contain transition-opacity duration-300 ${
                                photoLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                            onLoad={() => setPhotoLoading(false)}
                            onError={() => setPhotoLoading(false)}
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                            Фото {selectedPhoto.index + 1} из {reports.find(r => r.id === selectedPhoto.reportId)?.photos.length}
                        </div>
                    </div>
                    <button
                        onClick={handleNextPhoto}
                        className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-50 transition-colors p-2 rounded-full hover:bg-white/10 z-10"
                        disabled={selectedPhoto.index === (reports.find(r => r.id === selectedPhoto.reportId)?.photos.length || 0) - 1}
                        title="Следующее фото"
                    >
                        <ChevronRight size={48} />
                    </button>
                </div>
            )}
        </div>
    );
}; 