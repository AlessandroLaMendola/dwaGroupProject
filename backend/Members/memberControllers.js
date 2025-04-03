
const db = require('../config/database.js');
const bcrypt = require('bcrypt');
//const userId = require('../non members/Controllers/authController.js')


// Controller to get user details for settings and benefits??
const getUserProfile = async (req, res) => {
  try {

    console.log('🔹 Checking session:', req.session); // TODO Debugging log
    const userId = req.session.userId;      //TODO check which information is transfered over and used here

    if (!userId) {
      console.log('❌ Unauthorized: No userId in session');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log(`🔹 Fetching user data for userId: ${userId}`); //TODO delete debug
    const [rows] = await db.pool.query('SELECT * FROM baseuser WHERE memberID = ?', [userId]); //TODO needs to accurately take data from mysql
    if (rows.length === 0) {
      console.log('❌ User not found in database'); //TODO delete debug
      return res.status(404).json({ error: 'User not found' });
    } 

    const user = rows[0];
    console.log('✅ User Data Retrieved:', user); //TODO debug
    res.json(user);                           //TODO adjust depending on data taken from mysql

  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//first call for the dashboard data
const getUserProfileForDash = async (req, res) => {
  try {
    console.log('🔹 Checking session:', req.session); // TODO Debugging log
    const userId = req.session.userId;      //TODO check which information is transfered over and used here

    if (!userId) {
      console.log('❌ Unauthorized: No userId in session');
      return res.status(401).json({ error: 'Unauthorized' });

    }
    console.log(`🔹 Fetching user data for userId: ${userId}`); //TODO delete debug
    const [rows] = await db.pool.query('SELECT * FROM baseuser WHERE memberID = ?', [userId]); //TODO needs to accurately take data from mysql
    if (rows.length === 0) {
      console.log('❌ User not found in database'); //TODO delete debug
      return res.status(404).json({ error: 'User not found' });
    } 


    const user = rows[0];
    console.log('✅ User Data Retrieved:', user); //TODO debug
    res.json({                              //TODO adjust depending on data taken from mysql
      fullName: user.UserName,
      email: user.userEmail,
      otherInfo: user.otherInfo || 'No additional info available'

    });


  } catch (error) {
    console.error('Error fetching user data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}







const updateUserProfile = async (req, res) => {
  try {

      const userId = req.session.userId; //TODO does this need to be changed to match memberID
      const { UserName, userEmail, UserPhone, UserAddress, interest1, interest2, interest3 } = req.body;

      console.log('Updating profile for memberID:', userId);
      console.log('Received update data:', { UserName, userEmail, UserPhone, UserAddress, interest1, interest2, interest3 });

      


      await db.pool.query(
          `UPDATE baseuser 
           SET UserName = ?, userEmail = ?, UserPhone = ?, UserAddress = ?, interest1 = ?, interest2 = ?, interest3 = ? 
           WHERE memberID = ?`,
          [UserName, userEmail, UserPhone, UserAddress, interest1, interest2, interest3, userId]
      );

      res.json({ message: 'Profile updated successfully' });
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};



  const updateUserPassword = async (req, res) =>{

    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId; // TODO make sure the middleware part makes sense

      // Get get hash 
      const [user] = await db.pool.execute('SELECT password_hash FROM baseuser WHERE memberID = ?', [userId]);
      if (!user || user.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      const storedHash = user[0].password_hash;

      
      const isMatch = await bcrypt.compare(currentPassword, storedHash);
      if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash the new password
      const saltRounds = 10;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

      console.log('heres db: ', db);
      // Update password in the database
      await db.pool.execute('UPDATE baseuser SET password_hash = ? WHERE memberID = ?', [newHashedPassword, userId]);

      res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }



  };







  module.exports = { getUserProfile, updateUserProfile, updateUserPassword, getUserProfileForDash };

