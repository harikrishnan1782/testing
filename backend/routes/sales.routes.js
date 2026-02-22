const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication to all sales routes
router.use(authenticateToken);

// GET: Get all sales
router.get('/', async (req, res) => {
    try {
        const [sales] = await dbPool.query(`
            SELECT s.*, u.username 
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.sale_date DESC LIMIT 100
        `);
        
        res.json({
            success: true,
            data: sales
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load sales'
        });
    }
});

// GET: Get single sale with items
router.get('/:id', async (req, res) => {
    try {
        const [sales] = await dbPool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
        
        if (sales.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        const [items] = await dbPool.query(`
            SELECT si.*, i.name 
            FROM sale_items si 
            LEFT JOIN items i ON si.item_id = i.id 
            WHERE si.sale_id = ?
        `, [req.params.id]);

        res.json({
            success: true,
            data: {
                sale: sales[0],
                items: items
            }
        });
    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load sale details'
        });
    }
});

// POST: Create new sale
router.post('/', async (req, res) => {
    const connection = await dbPool.getConnection();
    
    try {
        let { items, customer_name, customer_phone } = req.body;
        const userId = req.user.id;

        await connection.beginTransaction();

        let subtotal = 0;
        const processedItems = [];

        // Process each item
        for (let item of items) {
            const id = parseInt(item.item_id);
            const qty = parseInt(item.quantity);
            
            if (!id || qty <= 0) continue;

            const [rows] = await connection.query(
                'SELECT name, price, quantity FROM items WHERE id = ? FOR UPDATE', 
                [id]
            );
            const dbItem = rows[0];

            if (!dbItem || dbItem.quantity < qty) {
                throw new Error(`Insufficient stock for ${dbItem ? dbItem.name : 'Item ID ' + id}`);
            }

            const itemTotalPrice = dbItem.price * qty;
            subtotal += itemTotalPrice;
            processedItems.push({ 
                id, 
                qty, 
                price: dbItem.price, 
                totalPrice: itemTotalPrice 
            });
        }

        // Calculate GST (18%)
        const gstAmount = (subtotal * 18) / 100;
        const totalAmount = subtotal + gstAmount;

        // Insert sale
        const [saleResult] = await connection.query(
            'INSERT INTO sales (user_id, customer_name, customer_phone, subtotal, gst_amount, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, customer_name || 'Walk-in', customer_phone || 'N/A', subtotal, gstAmount, totalAmount]
        );
        
        const newSaleId = saleResult.insertId;

        // Insert sale items and update inventory
        for (const pItem of processedItems) {
            await connection.query(
                'INSERT INTO sale_items (sale_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                [newSaleId, pItem.id, pItem.qty, pItem.price, pItem.totalPrice]
            );
            await connection.query(
                'UPDATE items SET quantity = quantity - ? WHERE id = ?', 
                [pItem.qty, pItem.id]
            );
        }

        await connection.commit();
        
        res.json({
            success: true,
            message: `Sale completed! Invoice #${newSaleId}`,
            data: { saleId: newSaleId }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error creating sale:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
