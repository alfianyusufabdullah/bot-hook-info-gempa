const { createClient } = require('@supabase/supabase-js');
const axios = require('axios').default
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function addToQueue(chatId) {
    const { error } = await client
        .from('users_queue')
        .insert([
            { id: chatId },
        ])

    if (error && error.message.includes('duplicate key value')) {
        await sendMessage(chatId, 'Kamu sudah didaftarkan untuk menerima notifikasi saat terjadi gempa')
    } else {
        await sendMessage(chatId, 'Berhasil didaftarkan, kamu akan diberitahu saat disuatu daerah terjadi gempa')
    }
}

async function sendMessage(chatId, message) {
    try {
        await axios.post(process.env.TELEGRAM_BOT_ENDPOINT + 'sendMessage', JSON.stringify(
            {
                "chat_id": chatId,
                "text": message
            }
        ), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.log(error);
    }
}

export default async function hook(request, response) {
    const chatId = request.body.message.chat.id;
    const command = request.body.message.text;

    if (command.includes('/notifyme')) {
        await addToQueue(chatId);
    } else {
        await sendMessage(chatId, 'Jika ingin mendapatkan notifikasi saat terjadi gempa, silakan kirimkan pesan /notifyme');
    }

    return response.json({ hello: "hai" });
}