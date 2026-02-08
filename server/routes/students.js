const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreateStudents
} = require('../controllers/studentController');

// All routes are protected and admin-only
router.use(auth, admin);

router.route('/')
    .get(getAllStudents)
    .post(createStudent);

router.post('/bulk', bulkCreateStudents);

router.route('/:id')
    .put(updateStudent)
    .delete(deleteStudent);

module.exports = router;
