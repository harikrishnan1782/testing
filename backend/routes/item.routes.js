const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication to all item routes
router.use(authenticateToken);

// GET: Get all items
router.get('/', async (req, res) => {
    try {
        const [items] = await dbPool.query('SELECT * FROM items ORDER BY name ASC');
        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load inventory'
        });
    }
});

// GET: Get single item by ID
router.get('/:id', async (req, res) => {
    try {
        const [items] = await dbPool.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
        
        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            data: items[0]
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load item details'
        });
    }
});

// POST: Add new item
router.post('/', async (req, res) => {
    const { sku, name, description, price, quantity, min_stock_level } = req.body;

    try {
        const [result] = await dbPool.query(
            'INSERT INTO items (sku, name, description, price, quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?)',
            [sku, name, description, price, quantity, min_stock_level]
        );
        
        res.json({
            success: true,
            message: 'Item added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error adding item:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'An item with that SKU already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to add item'
        });
    }
});

// PUT: Update item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, price, quantity, min_stock_level } = req.body;

    try {
        await dbPool.query(
            'UPDATE items SET sku = ?, name = ?, description = ?, price = ?, quantity = ?, min_stock_level = ? WHERE id = ?',
            [sku, name, description, price, quantity, min_stock_level, id]
        );
        
        res.json({
            success: true,
            message: 'Item updated successfully'
        });
    } catch (error) {
        console.error('Error updating item:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Another item is already using that SKU'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update item'
        });
    }
});

// DELETE: Delete item
router.delete('/:id', async (req, res) => {
    try {
        await dbPool.query('DELETE FROM items WHERE id = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete item: It is part of existing sales records'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to delete item'
        });
    }
});

module.exports = router;
