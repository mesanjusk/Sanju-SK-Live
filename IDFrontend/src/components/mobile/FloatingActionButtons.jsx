import { FaWhatsapp } from 'react-icons/fa';
export default function FloatingActionButtons({ whatsappNumber }) { return <a href={`https://wa.me/${String(whatsappNumber || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="fixed bottom-24 right-4 z-30 rounded-full bg-green-500 p-4 text-white shadow-xl"><FaWhatsapp /></a>; }
