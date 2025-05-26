import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';

interface FundRequest {
  title: string;
  description: string;
  targetAmount: number;
  endDate: string;
  category: string;
}

const CreateFund = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FundRequest>({
    title: '',
    description: '',
    targetAmount: 0,
    endDate: '',
    category: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fundRequest', new Blob([JSON.stringify(formData)], {
        type: 'application/json'
      }));
      
      if (image) {
        formDataToSend.append('imageFile', image);
      }

      await api.post('/api/funds/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать фонд. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          <span>Назад</span>
        </button>

        <h1 className="text-3xl font-light tracking-tight mb-8">Создать фонд</h1>

        {success ? (
          <div className="text-center py-12 bg-green-50 rounded-lg">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle size={48} className="text-green-600" />
              <h2 className="text-xl font-light text-green-600">Фонд успешно создан!</h2>
              <p className="text-gray-600">Сейчас вы будете перенаправлены на главную страницу...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-light mb-2">
                Название фонда
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                placeholder="Введите название фонда"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-light mb-2">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                placeholder="Опишите цели и задачи фонда"
              />
            </div>

            <div>
              <label htmlFor="targetAmount" className="block text-sm font-light mb-2">
                Целевая сумма
              </label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount || ''}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                placeholder="Введите целевую сумму"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-light mb-2">
                Дата окончания сбора
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-light mb-2">
                Категория
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              >
                <option value="">Выберите категорию</option>
                <option value="education">Образование</option>
                <option value="health">Здоровье</option>
                <option value="animals">Животные</option>
                <option value="environment">Экология</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-light mb-2">
                Изображение
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </div>
              ) : (
                'Создать фонд'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateFund; 