// TODO: reemplazar por el número real de WhatsApp de Studio Glam antes de publicar.
const WHATSAPP_NUMBER = "5492610000000";
const WHATSAPP_MESSAGE = "Hola! Quiero reservar un turno en Studio Glam.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
