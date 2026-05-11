import express from 'express';
import Users, { ROLE_DEFAULTS } from '../models/User.js';
import { v4 as uuid } from 'uuid';
import { generateToken } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { User_name, Password } = req.body;
  try {
    const user = await Users.findOne({ User_name });
    if (!user) return res.json({ status: 'notexist' });
    if (Password !== user.Password) return res.json({ status: 'invalid', message: 'Invalid credentials.' });

    const token = generateToken({ id: user._id, username: user.User_name, role: user.role });
    res.json({
      status: 'exist',
      token,
      role: user.role || 'admin',
      permissions: user.permissions,
      userGroup: user.User_group,
      userMobile: user.Mobile_number,
    });
  } catch (e) {
    console.error('Error during login:', e);
    res.json({ status: 'fail' });
  }
});

router.post('/addUser', async (req, res) => {
  const { User_name, Password, Mobile_number, role = 'admin' } = req.body;
  try {
    const check = await Users.findOne({ Mobile_number });
    if (check) return res.json('exist');

    const permissions = { ...ROLE_DEFAULTS[role] || ROLE_DEFAULTS.admin };
    const newUser = new Users({ User_name, Password, Mobile_number, User_uuid: uuid(), role, permissions });
    await newUser.save();
    res.json('notexist');
  } catch (e) {
    console.error('Error saving user:', e);
    res.status(500).json('fail');
  }
});

router.get('/GetUserList', async (req, res) => {
  try {
    const data = await Users.find({});
    if (data.length) res.json({ success: true, result: data.filter((a) => a.User_name) });
    else res.json({ success: false, message: 'User Not found' });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: err });
  }
});

router.put('/updateUser/:id', async (req, res) => {
  const { id } = req.params;
  const { User_name, Mobile_number, Password, role, permissions } = req.body;
  try {
    const updateData = { User_name, Mobile_number };
    if (Password) updateData.Password = Password;
    if (role) {
      updateData.role = role;
      // If permissions explicitly provided use them, otherwise derive from role
      updateData.permissions = permissions || { ...ROLE_DEFAULTS[role] };
    } else if (permissions) {
      updateData.permissions = permissions;
    }

    const user = await Users.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, result: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, result: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
});

router.get('/getUserByName/:username', async (req, res) => {
  try {
    const user = await Users.findOne({ User_name: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, result: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
});

router.delete('/DeleteUser/:userUuid', async (req, res) => {
  try {
    const result = await Users.findOneAndDelete({ User_uuid: req.params.userUuid });
    if (!result) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Users.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
