import { Router, Request, Response } from 'express';

const router = Router();

console.log('📋 DataRoutes module loaded');

// Simple test endpoint
router.get('/test', (req: Request, res: Response) => {
  console.log('🧪 Test endpoint called');
  res.json({
    success: true,
    message: 'Data routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Get countries from existing paises table
router.get('/countries', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching countries from database...');
    
    if (!req.db || !req.db.query) {
      console.error('❌ Database not available on request object');
      return res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }
    
    const countries = await req.db.query('SELECT * FROM paises WHERE estado = 1 ORDER BY pais');
    console.log(`✅ Found ${countries.length} countries`);
    if (countries.length > 0) {
      console.log('First country:', countries[0]);
    }
    
    res.json({
      success: true,
      data: countries,
      count: countries.length
    });
  } catch (error) {
    console.error('❌ Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching countries',
      error: error.message
    });
  }
});

// Get metals from existing metales table
router.get('/metals', async (req: Request, res: Response) => {
  try {
    const metals = await req.db.query('SELECT * FROM metales WHERE estado = 1 ORDER BY metal');
    
    res.json({
      success: true,
      data: metals,
      count: metals.length
    });
  } catch (error) {
    console.error('Error fetching metals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching metals',
      error: error.message
    });
  }
});

// Get companies from existing empresa table
router.get('/companies', async (req: Request, res: Response) => {
  try {
    const companies = await req.db.query('SELECT * FROM empresa WHERE estado = 1 ORDER BY nombre');
    
    res.json({
      success: true,
      data: companies,
      count: companies.length
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
});

// Validate username from existing usuario table
router.post('/validate-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const users = await req.db.query('SELECT id, username, correo FROM usuario WHERE username = $1 AND estado = 1', [username]);
    
    res.json({
      success: true,
      exists: users.length > 0,
      user: users.length > 0 ? users[0] : null
    });
  } catch (error) {
    console.error('Error validating username:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating username',
      error: error.message
    });
  }
});

// Get user profile
router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    const users = await req.db.query(`
      SELECT id, documento, nombre, apellido, username, correo, telefono, 
             creacion, empresa, pais, rol, estado 
      FROM usuario 
      WHERE username = $1 AND estado = 1
    `, [username]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

export default router;
