import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car } from 'lucide-react';
import { supabase } from '../interfaces/supabase';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Yeni araç state'leri
  const [newModel, setNewModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        operations ( id, is_completed )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Araçlar çekilirken hata oluştu:', error);
    } else {
      setVehicles(data);
    }
    setLoading(false);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newModel || !newPlate || !newDescription) return;

    // 1. Araç ekle
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .insert([{ model: newModel, plate_number: newPlate, status: 'active' }])
      .select()
      .single();

    if (vehicleError) {
      console.error('Araç eklenirken hata:', vehicleError);
      return;
    }

    // 2. İlk işlemi ekle
    if (vehicleData) {
      const { error: opError } = await supabase
        .from('operations')
        .insert([{ vehicle_id: vehicleData.id, description: newDescription, is_completed: false }]);
      
      if (opError) {
        console.error('İşlem eklenirken hata:', opError);
      }
    }

    setIsModalOpen(false);
    setNewModel('');
    setNewPlate('');
    setNewDescription('');
    fetchVehicles(); // Listeyi yenile
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Aktif İşlemler</h1>
          <p className="text-gray-500 mt-1">Tamirhanedeki tüm aktif araçları ve süreçlerini yönetin.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Yeni Araç Ekle
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Car size={32} />
          </div>
          <h3 className="text-lg font-medium text-textPrimary">Kayıtlı Araç Yok</h3>
          <p className="text-gray-500 mt-1">Hemen "Yeni Araç Ekle" butonu ile ilk aracı sisteme kaydedin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const totalOps = vehicle.operations?.length || 0;
            const completedOps = vehicle.operations?.filter(op => op.is_completed).length || 0;
            const progress = totalOps === 0 ? 0 : Math.round((completedOps / totalOps) * 100);

            return (
              <div 
                key={vehicle.id} 
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-bgSurface flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Car size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-textPrimary">{vehicle.plate_number}</h3>
                      <p className="text-sm text-gray-500">{vehicle.model}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                    İşlemde
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">İlerleme</span>
                    <span className="text-primary font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-right">
                    {completedOps} / {totalOps} İşlem Tamamlandı
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni Araç Ekle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Araç Ekle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Araç Modeli</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Örn: BMW 3.20i"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plaka</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Örn: 34 ABC 123"
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlk Yapılacak İşlem</label>
            <textarea 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
              placeholder="Örn: Periyodik bakım yapılacak."
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit">
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
