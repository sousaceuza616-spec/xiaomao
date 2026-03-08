// 飞书机器人 API
export default async function handler(req, res) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  // 飞书 URL 验证
  if (body.type === 'url_verification') {
    return res.status(200).json({ challenge: body.challenge });
  }

  // 处理消息接收
  if (body.type === 'im.message.receive_v1') {
    const message = body.event.message;
    const chatId = message.chat_id;
    const content = message.content;
    const senderId = message.sender_id;

    console.log('收到飞书消息:', { chatId, senderId, content });

    // TODO: 这里保存消息到文件，供 OpenClaw 读取
    // 或者调用 OpenClaw API

    return res.status(200).json({ success: true });
  }

  return res.status(200).json({ success: true });
}
