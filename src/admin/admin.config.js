import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';

// Register the Mongoose adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Import your models using ES Modules (assuming your models are also exported via ES Modules)
import User from '../models/User.js';
// import Service from '../models/Service.js';

const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: { navigation: 'User Management' },
    },
    // {
    //   resource: Service,
    //   options: { navigation: 'Service Management' },
    // },
  ],
  rootPath: '/admin',
});

const router = AdminJSExpress.buildRouter(adminJs);

// Export as ES Module
export { adminJs, router };

