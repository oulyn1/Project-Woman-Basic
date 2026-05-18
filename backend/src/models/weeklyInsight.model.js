import mongoose from 'mongoose'

const weeklyInsightSchema = new mongoose.Schema({
  weekStart:  { type: Date, required: true },
  weekEnd:    { type: Date, required: true },
  report:     { type: String, required: true },
  rawData:    { type: mongoose.Schema.Types.Mixed },
  createdAt:  { type: Date, default: Date.now }
}, {
  collection: 'weekly_insights'
})

const WeeklyInsight = mongoose.model('WeeklyInsight', weeklyInsightSchema)
export default WeeklyInsight
