const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');
const { Parser } = require('json2csv');

// Apply authentication
router.use(authenticateToken);

// GET: Sales report data
router.get('/', async (req, res) => {
    try {
        const [monthlySales] = await dbPool.query(`
            SELECT 
                DATE(sale_date) as date, 
                COUNT(id) as total_transactions, 
                SUM(total_amount) as total_revenue
            FROM sales
            WHERE MONTH(sale_date) = MONTH(CURRENT_DATE())
              AND YEAR(sale_date) = YEAR(CURRENT_DATE())
            GROUP BY DATE(sale_date)
            ORDER BY date DESC
        `);

        res.json({
            success: true,
            data: monthlySales
        });
    } catch (error) {
        console.error('Error loading reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load report data'
        });
    }
});

// GET: Export sales as CSV
router.get('/export', async (req, res) => {
    try {
        const { filter } = req.query;
        let query = '';

        if (filter === 'daily') {
            query = `
                SELECT 
                    s.id AS Sale_ID, 
                    u.username AS Staff_Member, 
                    s.subtotal AS Subtotal, 
                    s.gst_amount AS GST, 
                    s.total_amount AS Total, 
                    s.sale_date AS Date_and_Time
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE DATE(s.sale_date) = CURRENT_DATE()
                ORDER BY s.sale_date DESC
            `;
        } else {
            query = `
                SELECT 
                    s.id AS Sale_ID, 
                    u.username AS Staff_Member, 
                    s.subtotal AS Subtotal, 
                    s.gst_amount AS GST, 
                    s.total_amount AS Total, 
                    s.sale_date AS Date_and_Time
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE MONTH(s.sale_date) = MONTH(CURRENT_DATE())
                  AND YEAR(s.sale_date) = YEAR(CURRENT_DATE())
                ORDER BY s.sale_date DESC
            `;
        }

        const [salesData] = await dbPool.query(query);

        if (salesData.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No sales data found for the ${filter || 'monthly'} period`
            });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(salesData);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=sales_report_${filter || 'monthly'}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating the CSV file'
        });
    }
});

module.exports = router;
