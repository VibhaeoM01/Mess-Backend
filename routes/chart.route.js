import { getSentimentTrends } from "../controller/feedback.controller.js";

const router=express.Router();
router.get("/sentiment-trends", getSentimentTrends);
export default Chart;