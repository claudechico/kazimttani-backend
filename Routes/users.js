router.post('/updatePushToken', async (req, res) => {
  const { userId, pushToken } = req.body;
  
  const query = 'UPDATE users SET push_token = ? WHERE user_id = ?';
  
  try {
    await connection.query(query, [pushToken, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update push token' });
  }
}); 