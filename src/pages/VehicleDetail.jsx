import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { supabase } from '../interfaces/supabase';
import Button from '../components/Button';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOperation, setNewOperation] = useState('');

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  const fetchVehicleData = async () => {
    setLoading(true);
    
    // Araç bilgisini al
    const { data: vData, error: vError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (vError) {
      console.error('Araç bilgisi alınamadı:', vError);
      navigate('/dashboard');
      return;
    }
    
    setVehicle(vData);

    // İşlemleri al
    const { data: oData, error: oError } = await supabase
      .from('operations')
      .select('*')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: true });

    if (!oError) {
      setOperations(oData);
    }
    
    setLoading(false);
  };

  const handleToggleOperation = async (operationId, currentStatus) => {
    const { error } = await supabase
      .from('operations')
      .update({ is_completed: !currentStatus })
      .eq('id', operationId);

    if (!error) {
      setOperations(operations.map(op => 
        op.id === operationId ? { ...op, is_completed: !currentStatus } : op
      ));
    }
  };

  const handleDeleteOperation = async (operationId) => {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', operationId);

    if (!error) {
      setOperations(operations.filter(op => op.id !== operationId));
    }
  };

  const handleAddOperation = async (e) => {
    e.preventDefault();
    if (!newOperation.trim()) return;

    const { data, error } = await supabase
      .from('operations')
      .insert([{ vehicle_id: id, description: newOperation, is_completed: false }])
      .select()
      .single();

    if (!error && data) {
      setOperations([...operations, data]);
      setNewOperation('');
    }
  };

  const handleCompleteVehicle = async () => {
    if (window.confirm('Bu aracı teslim etmek (pasife çekmek) istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'completed' })
        .eq('id', id);

      if (!error) {
        navigate('/dashboard');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicle) return null;

  const totalOps = operations.length;
  const completedOps = operations.filter(op => op.is_completed).length;
  const progress = totalOps === 0 ? 0 : Math.round((completedOps / totalOps) * 100);

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-textPrimary transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Geri Dön
      </button>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight mb-2">{vehicle.plate_number}</h1>
          <p className="text-lg text-gray-500">{vehicle.model}</p>
        </div>
        <div className="w-full md:w-64">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Toplam İlerleme</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Operations Card (Dark) */}
      <div className="bg-textPrimary rounded-2xl p-6 md:p-8 shadow-lg mb-8 text-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Yapılan İşlemler</h2>
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium">
            {completedOps} / {totalOps}
          </span>
        </div>

        {operations.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p>Henüz bir işlem eklenmemiş.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {operations.map((op) => (
              <div 
                key={op.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  op.is_completed 
                    ? 'bg-white/5 border-white/10 opacity-70' 
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => handleToggleOperation(op.id, op.is_completed)}
                >
                  <button className="text-primary-100 hover:text-white transition-colors">
                    {op.is_completed ? (
                      <CheckCircle2 size={24} className="text-green-400" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <span className={`text-lg transition-all ${op.is_completed ? 'line-through text-gray-400' : 'text-white'}`}>
                    {op.description}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteOperation(op.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                  title="İşlemi Sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddOperation} className="mt-8 flex gap-3">
          <input
            type="text"
            placeholder="Yeni işlem ekle..."
            value={newOperation}
            onChange={(e) => setNewOperation(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Button type="submit" variant="primary" className="!px-6">
            <Plus size={20} />
            Ekle
          </Button>
        </form>
      </div>

      {/* Footer Action */}
      <div className="flex justify-end">
        <Button 
          variant="danger" 
          onClick={handleCompleteVehicle}
          className="!px-8 !py-4 text-lg font-bold shadow-lg shadow-red-500/20"
        >
          <CheckCircle2 size={24} />
          Aracı Teslim Et (Kapat)
        </Button>
      </div>
    </div>
  );
};

export default VehicleDetail;
