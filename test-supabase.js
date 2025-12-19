import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const SUPABASE_URL = 'https://woxbgotwkbbtiaerzrqu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveGJnb3R3a2JidGlhZXJ6cnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU3MzMsImV4cCI6MjA3NDkzMTczM30.oS0b-N1l7midTEZ1qlD8qovPB_IkeJM5cYele7AZ10M';

// 测试钱包地址（可以修改为实际地址）
const TEST_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 开始测试 Supabase API...\n');
console.log('📋 配置信息:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   测试钱包地址: ${TEST_WALLET_ADDRESS}\n`);

// 测试 1: 查询现有通知
async function testQueryNotifications() {
  console.log('='.repeat(60));
  console.log('📊 测试 1: 查询现有通知');
  console.log('='.repeat(60));
  
  try {
    const { data, error, status, statusText } = await supabase
      .from('signal_notifications')
      .select('*')
      .eq('wallet_address', TEST_WALLET_ADDRESS)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`\n✅ 查询成功 (状态码: ${status} ${statusText})`);
    console.log(`📦 返回数据数量: ${data?.length || 0}`);
    
    if (error) {
      console.log(`❌ 错误信息:`, error);
    }
    
    if (data && data.length > 0) {
      console.log('\n📄 通知数据:');
      data.forEach((notification, index) => {
        console.log(`\n  通知 #${index + 1}:`);
        console.log(`    ID: ${notification.id}`);
        console.log(`    钱包地址: ${notification.wallet_address}`);
        console.log(`    创建时间: ${notification.created_at}`);
        if (notification.notification_data) {
          const nd = notification.notification_data;
          console.log(`    新闻标题: ${nd.news_title || 'N/A'}`);
          console.log(`    最终得分: ${nd.final_score || 'N/A'}`);
          console.log(`    匹配标签: ${JSON.stringify(nd.matched_tags || [])}`);
        }
        console.log(`    完整数据: ${JSON.stringify(notification, null, 2)}`);
      });
    } else {
      console.log('\n⚠️  没有找到匹配的通知数据');
    }
    
    return { data, error, status, statusText };
  } catch (err) {
    console.error('❌ 查询失败:', err);
    return { error: err };
  }
}

// 测试 2: 查询所有通知（不限制钱包地址）
async function testQueryAllNotifications() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试 2: 查询所有通知（最近10条）');
  console.log('='.repeat(60));
  
  try {
    const { data, error, status, statusText } = await supabase
      .from('signal_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`\n✅ 查询成功 (状态码: ${status} ${statusText})`);
    console.log(`📦 返回数据数量: ${data?.length || 0}`);
    
    if (error) {
      console.log(`❌ 错误信息:`, error);
    }
    
    if (data && data.length > 0) {
      console.log('\n📄 通知数据:');
      data.forEach((notification, index) => {
        console.log(`\n  通知 #${index + 1}:`);
        console.log(`    钱包地址: ${notification.wallet_address}`);
        if (notification.notification_data) {
          const nd = notification.notification_data;
          console.log(`    新闻标题: ${nd.news_title || 'N/A'}`);
        }
      });
    } else {
      console.log('\n⚠️  没有找到通知数据');
    }
    
    return { data, error, status, statusText };
  } catch (err) {
    console.error('❌ 查询失败:', err);
    return { error: err };
  }
}

// 测试 3: 实时订阅通知
async function testSubscribeNotifications() {
  console.log('\n' + '='.repeat(60));
  console.log('📡 测试 3: 实时订阅通知');
  console.log('='.repeat(60));
  console.log('\n⏳ 正在订阅，等待新通知...');
  console.log('   (按 Ctrl+C 退出)\n');

  return new Promise((resolve) => {
    const channel = supabase
      .channel(`notifications:${TEST_WALLET_ADDRESS}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signal_notifications',
          filter: `wallet_address=eq.${TEST_WALLET_ADDRESS}`,
        },
        (payload) => {
          console.log('\n🔔 收到新通知!');
          console.log('📦 Payload 信息:');
          console.log(`   事件类型: ${payload.eventType}`);
          console.log(`   表名: ${payload.table}`);
          console.log(`   架构: ${payload.schema}`);
          
          if (payload.new) {
            const notification = payload.new;
            console.log('\n📄 通知详情:');
            console.log(`   ID: ${notification.id}`);
            console.log(`   钱包地址: ${notification.wallet_address}`);
            console.log(`   创建时间: ${notification.created_at}`);
            
            if (notification.notification_data) {
              const data = notification.notification_data;
              console.log(`\n📰 通知内容:`);
              console.log(`   新闻标题: ${data.news_title || 'N/A'}`);
              console.log(`   最终得分: ${data.final_score || 'N/A'}`);
              console.log(`   匹配标签: ${JSON.stringify(data.matched_tags || [])}`);
            }
            
            console.log(`\n📋 完整数据: ${JSON.stringify(notification, null, 2)}`);
          }
          
          if (payload.old) {
            console.log('\n📋 旧数据:', JSON.stringify(payload.old, null, 2));
          }
        }
      )
      .subscribe((status) => {
        console.log(`\n📡 订阅状态: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ 订阅成功！正在监听新通知...\n');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ 订阅失败：频道错误');
          resolve();
        } else if (status === 'TIMED_OUT') {
          console.log('⏱️  订阅超时');
          resolve();
        } else if (status === 'CLOSED') {
          console.log('🔒 订阅已关闭');
          resolve();
        }
      });

    // 30秒后自动取消订阅（用于测试）
    setTimeout(() => {
      console.log('\n⏰ 30秒测试时间到，取消订阅...');
      channel.unsubscribe();
      console.log('✅ 测试完成');
      resolve();
    }, 30000);
  });
}

// 测试 4: 检查表结构
async function testTableStructure() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试 4: 检查表结构');
  console.log('='.repeat(60));
  
  try {
    // 尝试查询一条数据来了解表结构
    const { data, error } = await supabase
      .from('signal_notifications')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ 错误: ${error.message}`);
      console.log(`   错误详情: ${JSON.stringify(error, null, 2)}`);
      return;
    }

    if (data && data.length > 0) {
      console.log('\n📋 表结构示例（基于第一条数据）:');
      const sample = data[0];
      console.log('   字段列表:');
      Object.keys(sample).forEach((key) => {
        const value = sample[key];
        const type = typeof value;
        console.log(`     - ${key}: ${type}${value === null ? ' (null)' : ''}`);
      });
    } else {
      console.log('\n⚠️  表中没有数据，无法推断结构');
    }
  } catch (err) {
    console.error('❌ 检查失败:', err);
  }
}

// 主函数
async function main() {
  try {
    // 测试 1: 查询特定钱包的通知
    await testQueryNotifications();
    
    // 测试 2: 查询所有通知
    await testQueryAllNotifications();
    
    // 测试 4: 检查表结构
    await testTableStructure();
    
    // 测试 3: 实时订阅（最后执行，因为会持续运行）
    console.log('\n');
    await testSubscribeNotifications();
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
  }
  
  console.log('\n✅ 所有测试完成');
  process.exit(0);
}

// 运行测试
main().catch((error) => {
  console.error('❌ 程序异常:', error);
  process.exit(1);
});

