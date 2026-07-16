import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { api } from '../config/env';

const Promociones = () => {
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/promociones/activas')
          .then(response => {
            setPromociones(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Error al cargar promociones", error);
            setLoading(false);
          });
    }, []);

    if (loading) {
        return <div className="p-8 text-2xl font-bold">Cargando promociones...</div>;
    }

    return (
        <div className="p-8 w-full h-full bg-white overflow-y-auto">
            <h1 className="text-4xl font-extrabold text-black mb-10 uppercase tracking-tight">
                Promociones Activas
            </h1>


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {promociones.map((promo) => (
                    <div
                        key={promo.id}
                        className="border-2 border-black rounded-2xl overflow-hidden bg-white flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg"
                    >

                        <div className="p-8 flex flex-col items-center justify-center h-48 relative">
                            <Tag className="absolute top-4 left-4 text-[#a64d32]" size={32} />

                            <span className="text-6xl font-black text-[#a64d32] tracking-tighter">
                {promo.descuento}
              </span>

                            <span className="text-gray-500 font-bold mt-4 text-sm uppercase tracking-wider">
                {promo.vigencia}
              </span>
                        </div>


                        <div className="bg-[#ebdcc9] border-t-2 border-black p-6 text-center">
              <span className="text-2xl font-extrabold text-black uppercase tracking-wide">
                {promo.aplicaA}
              </span>
                        </div>
                    </div>
                ))}
            </div>

            {promociones.length === 0 && !loading && (
                <div className="text-xl font-bold text-gray-500 mt-10">
                    No hay promociones activas en este momento.
                </div>
            )}
        </div>
    );
};

export default Promociones;