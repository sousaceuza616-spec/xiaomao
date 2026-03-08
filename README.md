# 飞书机器人 API

## 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel 创建项目并导入
3. 配置环境变量：
   - FEISHU_APP_ID
   - FEISHU_APP_SECRET
   - FEISHU_VERIFICATION_TOKEN

## API 地址

`https://your-project.vercel.app/api`

## 飞书配置

在飞书开放平台设置事件订阅：
- 请求地址：`https://your-project.vercel.app/api`
- 订阅事件：接收消息 (im.message.receive_v1)
