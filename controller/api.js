const db                    = require('../connection')
const { param }             = require('../route')
const bcrypt                = require('bcrypt');
const jwt                   = require('jsonwebtoken');
const { validationResult }  = require('express-validator');
var JWT_KEY                 = 'sourabh';

exports.login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
        db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, data) => {
            console.log(data)
            if (err) {
                res.status(500).json({ msg: 'Database error' });
            } else if (data == '') {
                res.status(400).json({ msg: 'Email id is not valid' });
            } else if (data.length > 0) {
                const isMatch = await bcrypt.compare(req.body.password, data[0].password);

                if (!isMatch) {
                    return res.status(400).json({ msg: 'Invalid credentials' });
                }

                const token = jwt.sign({ data }, JWT_KEY, { expiresIn: '1h' })
                res.status(200).json({ msg: 'Login successful', data: data, token: token });
            }
        });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(500).json({ msg: 'Internal server error' });
    }
};


// Create a new category
exports.addcategory = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required.' });
    }

    db.query(`SELECT * FROM category WHERE Category_name = ?`, [name], async (err, data) => {
        console.log(data)
        if (err) {
            res.status(500).json({ msg: 'Database error' });
        } else if (data != '') {
            res.status(400).json({ msg: 'This category is already exist' });
        } else {
            const insertQuery = 'INSERT INTO category (Category_name) VALUES (?)';
            db.query(insertQuery, [name], (err, result) => {
                if (err) {
                    console.error('Error creating category', err);
                    return res.status(500).json({ message: 'Failed to create category.' });
                }
                res.status(201).json({ id: result.insertId, name });
            });
        }
    })
}

// Get all categories
exports.getcategory = (req, res) => {
    const selectQuery = 'SELECT * FROM category';
    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ message: 'Failed to fetch categories.' });
        } else if (results.length < 0) {
            res.status(404).json({ message: 'Not any categories found.' })
        }
        res.json(results);
    });
}

// Update a category
exports.upadtecategory = (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required.' });
    }

    const updateQuery = 'UPDATE category SET Category_name = ? WHERE id = ?';
    db.query(updateQuery, [name, categoryId], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ message: 'Failed to update category.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.json({ msg: 'Category updated', id: categoryId, name });
    });
}


// Delete a category (if empty)
exports.deletecategory = (req, res) => {
    const { categoryId } = req.params;
  
    const countQuery = 'SELECT COUNT(*) AS servicecount FROM service WHERE Category_id = ?';
    db.query(countQuery, [categoryId], (err, results) => {
      if (err) {
        console.error('Error checking services for category:', err);
        return res.status(500).json({ message: 'Failed to check services for category.' });
      }
  
      const serviceCount = results[0].servicecount;
      if (serviceCount == 0) {
            // Delete category
            const deleteQuery = 'DELETE FROM category WHERE id = ?';
            db.query(deleteQuery, [categoryId], (err, result) => {
                if (err) {
                console.error('Error deleting category:', err);
                    return res.status(500).json({ message: 'Failed to delete category.' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Category not found.' });
                }
                res.json({ message: 'Category deleted successfully.' });
            });
      }else{
        return res.status(400).json({ message: 'service not empty.' });
      }
    });
  };

// addservice
exports.addservice = (req, res) => {
    const { categoryId } = req.params;
    const { service_name, type, price, duration, service_pricetype } = req.body;

    if (!service_name || !type || !price ||duration || service_pricetype) {
        return res.status(400).json({ message: 'All details are required.' });
    }

    const queryService = 'INSERT INTO service (Category_id, Service_name, Type) VALUES (?, ?, ?)';
    db.query(queryService, [categoryId, service_name, type], (error, results) => {
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const serviceId = results.insertId;

        const queryServicePrice = 'INSERT INTO service_price (Service_id, Duration, Price, Type) VALUES (?, ?, ?, ?)';
        db.query(queryServicePrice, [serviceId, duration, price, service_pricetype], (error, result) => {
            if (error) {
                return res.status(400).json({ message: error.message });
            }

            res.status(201).json({
                message: 'Service created',
                id: serviceId,
                categoryId,
                service_name,
                type,
                price,
                duration,
                service_pricetype
            });
        });
    });
};



// Get services by categoryid
exports.getservice=(req,res) =>{
    const { categoryId } = req.params;
  
    const query = 'SELECT * FROM service WHERE Category_id = ?';
    db.query(query, [categoryId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error.' });
      }else if(results == ''){
        return res.status(400).json({ message: 'Not any service found' });
      }
      res.json(results);
    });
};


// // Update a service
exports.updateservice = (req, res) => {
    const { categoryId, serviceId } = req.params;
    const { name, type } = req.body;
  
    const query = 'UPDATE service SET Service_name = ?, Type = ? WHERE Category_id = ? AND id = ?';
    db.query(query, [name, type, categoryId, serviceId], (error, results) => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      res.json({msg:'updated', id: serviceId, categoryId, name, type });
    });
};
  

exports.deleteService = (req, res) => {
    const { serviceId, categoryId } = req.params;
  
    const query = 'DELETE FROM service WHERE id = ? AND Category_id = ?';
    db.query(query, [serviceId, categoryId], (error, results) => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Service not found or does not belong to the category.' });
      }
      res.json({ message: 'Service deleted successfully.' });
    });
};

