import cron from 'node-cron'
import { getCategoryInsights } from '~/services/recommendation.service.js'
import { aiHelper } from '~/utils/aiHelper.js'
import WeeklyInsight from '~/models/weeklyInsight.model.js'

/**
 * Cron job chạy mỗi thứ Hai 8:00 sáng.
 * Tổng hợp insights → Groq AI → lưu báo cáo vào DB.
 */
cron.schedule('0 8 * * 1', async () => {
  console.log('[WeeklyInsight] Bắt đầu tạo báo cáo tuần...')

  try {
    const insights = await getCategoryInsights()

    const now = new Date()
    const weekEnd = new Date(now)
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)

    const insightsText = JSON.stringify(insights, null, 2)

    const messages = [
      {
        role: 'user',
        content: `Dựa trên dữ liệu engagement tuần qua của cửa hàng Woman Basic:\n${insightsText}\n\nHãy viết một báo cáo ngắn (150-200 từ) gồm:\n- Top 3 danh mục được quan tâm nhất và lý do có thể\n- 1-2 cảnh báo nếu có danh mục giảm mạnh\n- 2-3 đề xuất hành động cụ thể cho admin tuần tới\nViết bằng tiếng Việt, giọng chuyên nghiệp, súc tích.`
      }
    ]

    const report = await aiHelper.callGroqAI({
      contextName: 'WeeklyInsight',
      messages,
      max_tokens: 500,
      temperature: 0.6
    })

    await WeeklyInsight.create({
      weekStart,
      weekEnd,
      report,
      rawData: insights,
      createdAt: now
    })

    console.log('[WeeklyInsight] Báo cáo tuần đã được lưu thành công.')
  } catch (err) {
    console.error('[WeeklyInsight] Lỗi tạo báo cáo:', err.message)
  }
}, {
  timezone: 'Asia/Ho_Chi_Minh'
})
