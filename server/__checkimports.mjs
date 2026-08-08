const mods = [
  './models/User.js',
  './controllers/settingsController.js',
  './routes/settingsRoutes.js',
  './services/notificationService.js',
  './controllers/userController.js',
  './controllers/authController.js',
];
for (const m of mods) {
  try {
    const mod = await import(m);
    console.log('OK  ', m, Object.keys(mod));
  } catch (e) {
    console.log('FAIL', m, e.message);
  }
}
process.exit(0);
