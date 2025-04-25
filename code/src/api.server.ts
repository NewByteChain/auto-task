import express from 'express';
import dotenv from 'dotenv';
import mutualRoutes from './routes/mutualRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 9999;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 路由
app.use('/api/mutual', mutualRoutes);



// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
