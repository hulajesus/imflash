#!/usr/bin/env node

/**
 * Supabase 实时订阅快速测试脚本
 * 
 * 使用方法：
 * node scripts/test-supabase.js <钱包地址>
 * 
 * 示例：
 * node scripts/test-supabase.js 0x1234567890abcdef1234567890abcdef12345678
 */

const SUPABASE_URL = 'https://woxbgotwkbbtiaerzrqu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveGJnb3R3a2JidGlhZXJ6cnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU3MzMsImV4cCI6MjA3NDkzMTczM30.oS0b-N1l7midTEZ1qlD8qovPB_IkeJM5cYele7AZ10M';

async function sendTestNotification(walletAddress) {
  if (!walletAddress) {
    console.error('❌ 请提供钱包地址');
    console.log('使用方法: node scripts/test-supabase.js <钱包地址>');
    process.exit(1);
  }

  // 转换为小写
  const address = walletAddress.toLowerCase();

  console.log('🚀 发送测试通知...');
  console.log('📍 目标地址:', address);

  const testData = {
    wallet_address: address,
    notification_data: {
      news_title: `测试通知 - ${new Date().toLocaleString('zh-CN')}`,
      final_score: Math.random() * 10,
      matched_tags: ['测试', 'DeFi', '交易'],
      content: '这是一条通过脚本发送的测试通知',
      category: '测试分类',
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/signal_notifications`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log('✅ 测试通知发送成功！');
    console.log('📊 通知内容:', JSON.stringify(testData.notification_data, null, 2));
    console.log('\n💡 提示:');
    console.log('1. 检查浏览器控制台是否收到通知');
    console.log('2. 检查是否弹出浏览器原生通知');
    console.log('3. 检查信息流页面是否自动刷新');
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    console.log('\n🔍 排查建议:');
    console.log('1. 检查 Supabase 项目是否正常运行');
    console.log('2. 检查 signal_notifications 表是否存在');
    console.log('3. 检查 API Key 是否正确');
    console.log('4. 检查网络连接');
    process.exit(1);
  }
}

// 获取命令行参数
const walletAddress = process.argv[2];
sendTestNotification(walletAddress);
