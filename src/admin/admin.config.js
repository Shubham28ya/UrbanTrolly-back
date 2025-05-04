import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';

// Register the Mongoose adapter
AdminJS.registerAdapter(AdminJSMongoose);
import User from '../models/User.js';
const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: { navigation: 'User Management' },
    },

  ],
  rootPath: '/admin',
});

const router = AdminJSExpress.buildRouter(adminJs);

// Export as ES Module
export { adminJs, router };

