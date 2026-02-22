const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication
router.use(authenticateToken);

// GET: Dashboard metrics
router.get('/metrics', async (req, res) => {
    try {
        const [
            [totalItemsResult],
            [salesMetricsResult],
            [lowStockItems],
            [recentSales]
        ] = await Promise.all([
            dbPool.query('SELECT COUNT(*) as count FROM items'),
            dbPool.query('SELECT COUNT(*) as total_transactions, SUM(total_amount) as total_revenue FROM sales'),
            dbPool.query('SELECT id, name, sku, quantity, min_stock_level FROM items WHERE quantity <= min_stock_level ORDER BY quantity ASC LIMIT 10'),
            dbPool.query(`
                SELECT s.id, s.total_amount, s.sale_date, u.username 
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY s.sale_date DESC
                LIMIT 5
            `)
        ]);

        const totalItems = totalItemsResult[0].count;
        const totalRevenue = salesMetricsResult[0].total_revenue || 0;
        const totalTransactions = salesMetricsResult[0].total_transactions;

        res.json({
            success: true,
            data: {
                metrics: {
                    totalItems,
                    totalRevenue,
                    totalTransactions
                },
                lowStockItems,
                recentSales
            }
        });

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard metrics'
        });
    }
});

module.exports = router;
