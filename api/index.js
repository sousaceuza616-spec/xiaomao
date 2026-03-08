const crypto = require('crypto');

// 从环境变量读取配置
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';
const FEISHU_VERIFICATION_TOKEN = process.env.FEISHU_VERIFICATION_TOKEN || '';

/**
 * 验证飞书请求签名
 */
function verifySignature(timestamp, nonce, signature, body) {
  const signStr = timestamp + nonce + FEISHU_VERIFICATION_TOKEN;
  const calculatedSignature = crypto
    .createHmac('sha256', FEISHU_APP_SECRET)
    .update(signStr)
    .digest('base64');
  
  return calculatedSignature === signature;
}

/**
 * 获取飞书 access token
 */
async function getAccessToken() {
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    })
  });
  
  const data = await response.json();
  return data.tenant_access_token;
}

/**
 * 发送消息到飞书
 */
async function sendToFeishu(chatId, content, msgType = 'text') {
  const token = await getAccessToken();
  
  const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      receive_id: chatId,
      msg_type: msgType,
      content: JSON.stringify(content),
      receive_id_type: 'chat_id'
    })
  });
  
  return await response.json();
}

/**
 * 主请求处理
 */
export default async function handler(req, res) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { headers, body } = req;
  
  // 获取签名相关信息
  const timestamp = headers['x-lark-request-timestamp'];
  const nonce = headers['x-lark-request-nonce'];
  const signature = headers['x-lark-signature'];
  
  // 验证签名（生产环境建议开启）
  if (FEISHU_APP_SECRET && FEISHU_VERIFICATION_TOKEN) {
    const isValid = verifySignature(timestamp, nonce, signature, body);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // 处理飞书事件
  const event = body;
  
  // 处理 URL 验证请求（飞书会先发送一个验证请求）
  if (event.type === 'url_verification') {
    return res.status(200).json({ challenge: event.challenge });
  }
  
  // 处理消息接收事件
  if (event.type === 'im.message.receive_v1') {
    const messageData = event.event.message;
    const senderId = messageData.sender_id;
    const chatId = messageData.chat_id;
    const content = messageData.content;
    
    console.log('收到消息:', {
      senderId,
      chatId,
      content
    });
    
    // 这里可以把消息保存到数据库或文件，供 OpenClaw 读取
    // 或者调用 OpenClaw 的 API 来处理
    
    // 简单回复示例（可选）
    // await sendToFeishu(chatId, { text: '收到消息了！' });
    
    return res.status(200).json({ success: true });
  }

  // 其他事件类型
  console.log('未知事件类型:', event.type);
  return res.status(200).json({ success: true });
}
