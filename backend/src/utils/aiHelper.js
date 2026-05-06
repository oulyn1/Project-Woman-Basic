import axios from 'axios'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

/**
 * Gọi Groq API với cơ chế tự động thử lại (Retry)
 */
const callGroqAI = async ({ messages, response_format = null, temperature = 0.7, max_tokens = 2048, contextName = 'AI' }) => {
  const groqKey = env.GROQ_API_KEY
  if (!groqKey) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Thiếu cấu hình GROQ_API_KEY cho ${contextName}.`)
  }

  const MAX_RETRIES = 3
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages,
          response_format,
          temperature,
          max_tokens
        },
        {
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      const content = response.data?.choices?.[0]?.message?.content || ''
      if (!content) throw new Error('AI trả về nội dung rỗng')

      return content
    } catch (error) {
      const status = error.response?.status
      const isRetryable = status === 503 || status === 429 || status === 500
      
      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`[${contextName}] Lỗi API (Lần ${attempt}/${MAX_RETRIES}). Thử lại sau ${attempt * 2}s...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        continue
      }

      const msg = error.response?.data?.error?.message || error.message
      throw new ApiError(StatusCodes.BAD_GATEWAY, `Lỗi khi gọi Groq API (${contextName}): ${msg}`)
    }
  }
}

/**
 * Parse JSON an toàn từ chuỗi trả về của AI
 */
const parseSafeJSON = (text) => {
  try {
    let jsonStr = text.trim()

    // Loại bỏ markdown code block nếu có
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }

    // Fallback: tìm object JSON đầu tiên
    if (!jsonStr.startsWith('{')) {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Không tìm thấy JSON hợp lệ')
      jsonStr = jsonMatch[0]
    }

    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('[AI Helper] Parse Error:', error.message, '| Raw text:', text)
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Không thể xử lý dữ liệu từ AI.')
  }
}

export const aiHelper = {
  callGroqAI,
  parseSafeJSON,
  GROQ_MODEL,
  GROQ_API_URL
}
